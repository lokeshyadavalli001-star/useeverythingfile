import { NextRequest, NextResponse } from "next/server";
import { SecurityValidator } from "@/lib/server/security-validator";
import { SecurityLogger } from "@/lib/server/security-logger";
import { RateLimiter } from "@/lib/server/rate-limiter";
import { TempStorage, TempFileJob } from "@/lib/server/temp-storage";
import { ConverterWorker } from "@/lib/server/converter-worker";
import { FILE_SIZE_LIMITS } from "@/lib/config/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");

  // 1. Rate Limiting Check
  const rateCheck = RateLimiter.check(ip, 15, 60000);
  if (!rateCheck.isAllowed) {
    const errorRef = SecurityLogger.generateErrorRef();
    SecurityLogger.logSecurityEvent("RATE_LIMIT_EXCEEDED", "/api/pdf-to-word", "warning", ip, userAgent);
    return NextResponse.json(
      {
        error: "Too many conversion requests. Please try again shortly.",
        reference: errorRef,
      },
      { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
    );
  }

  let job: TempFileJob | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided.", reference: SecurityLogger.generateErrorRef() },
        { status: 400 }
      );
    }

    // 2. File Size Validation
    if (file.size > FILE_SIZE_LIMITS.CONVERSION_MAX_BYTES) {
      SecurityLogger.logSecurityEvent("OVERSIZED_UPLOAD", "/api/pdf-to-word", "warning", ip, userAgent, {
        size: file.size,
      });
      return NextResponse.json(
        {
          error: "File is too large to process safely. Maximum file size is 25 MB.",
          reference: SecurityLogger.generateErrorRef(),
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 3. Defense-in-Depth Validation (MIME, Extension, Magic Bytes)
    const validation = SecurityValidator.validateUpload(file.name, file.type, uint8Array, "pdf");
    if (!validation.isValid) {
      SecurityLogger.logSecurityEvent("INVALID_FILE_UPLOAD", "/api/pdf-to-word", "high", ip, userAgent, {
        reason: validation.errorReason || "validation_failure",
      });
      return NextResponse.json(
        {
          error: "Invalid or corrupted document format.",
          reference: SecurityLogger.generateErrorRef(),
        },
        { status: 400 }
      );
    }

    // 4. Allocate isolated temp space outside web root
    job = await TempStorage.createJob("pdf", "docx", Buffer.from(uint8Array));

    // 5. Run conversion via isolated worker
    const conversion = await ConverterWorker.convertPdfToWord(job);

    if (!conversion.success || !conversion.outputBuffer) {
      const errorRef = SecurityLogger.generateErrorRef();
      SecurityLogger.logSecurityEvent("CONVERSION_WORKER_FAILED", "/api/pdf-to-word", "warning", ip, userAgent);
      return NextResponse.json(
        {
          error: "We couldn't process this document safely.",
          reference: errorRef,
        },
        { status: 500 }
      );
    }

    // 6. Safe download response headers
    const safeOutputName = `${validation.sanitizedDisplayName.replace(/\.pdf$/i, "")}.docx`;

    return new NextResponse(conversion.outputBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeOutputName)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  } catch (err) {
    const errorRef = SecurityLogger.generateErrorRef();
    SecurityLogger.logSecurityEvent("SERVER_CONVERSION_ERROR", "/api/pdf-to-word", "critical", ip, userAgent);
    return NextResponse.json(
      {
        error: "Something went wrong during conversion. Please try again.",
        reference: errorRef,
      },
      { status: 500 }
    );
  } finally {
    // 7. Immediate Temporary File Lifecycle Cleanup
    if (job) {
      await TempStorage.purgeJob(job);
    }
  }
}
