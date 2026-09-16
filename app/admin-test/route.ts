import { NextRequest, NextResponse } from "next/server";
import { SecurityLogger } from "@/lib/server/security-logger";

export const dynamic = "force-dynamic";

function handleHoneypotProbe(request: NextRequest, endpoint: string) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");

  // Log honeypot probe event without capturing any user credentials
  SecurityLogger.logSecurityEvent("HONEYPOT_PROBE_DETECTED", endpoint, "high", ip, userAgent, {
    method: request.method,
    probeType: "automated_recon_decoy",
  });

  // Return fabricated decoy payload with non-functional placeholder values
  return NextResponse.json(
    {
      system: "decoy-node-isolated",
      status: "restricted",
      service_account: "decoy-admin",
      diagnostic_key: "INVALID-DECOY-NON-FUNCTIONAL",
      maintenance_mode: true,
      timestamp: new Date().toISOString(),
    },
    {
      status: 403,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  return handleHoneypotProbe(request, "/admin-test");
}

export async function POST(request: NextRequest) {
  return handleHoneypotProbe(request, "/admin-test");
}
