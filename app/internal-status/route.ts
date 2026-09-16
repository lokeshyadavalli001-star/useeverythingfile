import { NextRequest, NextResponse } from "next/server";
import { SecurityLogger } from "@/lib/server/security-logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");

  SecurityLogger.logSecurityEvent("HONEYPOT_PROBE_DETECTED", "/internal-status", "high", ip, userAgent, {
    method: "GET",
  });

  return NextResponse.json(
    {
      cluster: "decoy-internal",
      node: "worker-decoy-0",
      status: "unauthorized",
    },
    { status: 403, headers: { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } }
  );
}
