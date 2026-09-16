import { NextRequest, NextResponse } from "next/server";
import { SecurityValidator } from "@/lib/server/security-validator";
import { SecurityLogger } from "@/lib/server/security-logger";
import { RateLimiter } from "@/lib/server/rate-limiter";
import { TempStorage, TempFileJob } from "@/lib/server/temp-storage";
import { ConverterWorker } from "@/lib/server/converter-worker";
import { ZipGuard } from "@/lib/server/zip-guard";
import { FILE_SIZE_LIMITS } from "@/lib/config/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");

  // 1. Rate Limiting Check
  const rateCheck = RateLimiter.check(ip, 15, 60000);
  if (!rateCheck.isAllowed) {
    const errorRef = SecurityLogger.generateErrorRef();
    SecurityLogger.logSecurityEvent("RATE_LIMIT_EXCEEDED", "/api/word-to-pdf", "warning", ip, userAgent);
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

    // 2. Size limit
    if (file.size > FILE_SIZE_LIMITS.CONVERSION_MAX_BYTES) {
      SecurityLogger.logSecurityEvent("OVERSIZED_UPLOAD", "/api/word-to-pdf", "warning", ip, userAgent, {
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

    // 3. Extension & Magic Bytes Validation
    const validation = SecurityValidator.validateUpload(file.name, file.type, uint8Array, "docx");
    if (!validation.isValid) {
      SecurityLogger.logSecurityEvent("INVALID_FILE_UPLOAD", "/api/word-to-pdf", "high", ip, userAgent, {
        reason: validation.errorReason || "validation_failure",
      });
      return NextResponse.json(
        {
          error: "Invalid or corrupted Word document format.",
          reference: SecurityLogger.generateErrorRef(),
        },
        { status: 400 }
      );
    }

    // 4. Deep ZIP & DOCX Structure Inspection (Zip bomb & path traversal protection)
    const zipInspection = await ZipGuard.inspectDocxArchive(uint8Array);
    if (!zipInspection.isValid) {
      SecurityLogger.logSecurityEvent("MALICIOUS_DOCX_BLOCKED", "/api/word-to-pdf", "critical", ip, userAgent, {
        reason: zipInspection.errorReason || "zip_guard_rejection",
      });
      return NextResponse.json(
        {
          error: "Document failed security structure validation.",
          reference: SecurityLogger.generateErrorRef(),
        },
        { status: 400 }
      );
    }

    // 5. Allocate isolated temp space
    job = await TempStorage.createJob("docx", "pdf", Buffer.from(uint8Array));

    // 6. Execute conversion worker
    const conversion = await ConverterWorker.convertWordToPdf(job);

    if (!conversion.success || !conversion.outputBuffer) {
      const errorRef = SecurityLogger.generateErrorRef();
      SecurityLogger.logSecurityEvent("CONVERSION_WORKER_FAILED", "/api/word-to-pdf", "warning", ip, userAgent, {
        reason: conversion.errorReason || "unknown_failure",
      });
      return NextResponse.json(
        {
          error: conversion.errorReason || "We couldn't process this Word document. Reference: " + errorRef,
          reference: errorRef,
        },
        { status: 500 }
      );
    }

    const safeOutputName = `${validation.sanitizedDisplayName.replace(/\.docx$/i, "")}.pdf`;

    return new NextResponse(conversion.outputBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeOutputName)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  } catch (err) {
    const errorRef = SecurityLogger.generateErrorRef();
    SecurityLogger.logSecurityEvent("SERVER_CONVERSION_ERROR", "/api/word-to-pdf", "critical", ip, userAgent);
    return NextResponse.json(
      {
        error: "Something went wrong during conversion. Please try again.",
        reference: errorRef,
      },
      { status: 500 }
    );
  } finally {
    // 7. Immediate Temporary File Cleanup
    if (job) {
      await TempStorage.purgeJob(job);
    }
  }
}
