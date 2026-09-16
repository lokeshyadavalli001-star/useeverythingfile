import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "everything-file",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    }
  );
}
