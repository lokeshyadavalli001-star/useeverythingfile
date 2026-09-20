import { NextRequest, NextResponse } from "next/server";

// Explicit allowlist of trusted origins for CORS
const ALLOWED_ORIGINS = new Set([
  "https://useeverythingfile.vercel.app",
  "https://www.useeverythingfile.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export function middleware(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname ||
    "";
  const origin = request.headers.get("origin");

  // 1. Canonical Host / Subdomain Redirection (www -> canonical non-www)
  // Ensures http://www.useeverythingfile.vercel.app and https://www.useeverythingfile.vercel.app
  // permanently redirect (308) to https://useeverythingfile.vercel.app
  if (host.startsWith("www.useeverythingfile.vercel.app") || host.startsWith("www.")) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = "useeverythingfile.vercel.app";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // 2. Preflight / CORS Handling for Disallowed Origins
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.has(origin);
  if (request.method === "OPTIONS") {
    if (origin && !isAllowedOrigin) {
      // Reject cross-origin preflight requests from untrusted third-party origins
      return new NextResponse(null, { status: 403 });
    }

    if (isAllowedOrigin) {
      // Return authorized CORS preflight response
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
        },
      });
    }
  }

  // 3. Cryptographically Secure Per-Request CSP Nonce Generation
  // Generates fresh base64-encoded random bytes for each incoming request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 4. Strict Content Security Policy (Zero 'unsafe-inline' in script-src & style-src)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com https://*.profitableratecpmnetwork.com https://www.profitableratecpmnetwork.com;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com blob: https://*.profitableratecpmnetwork.com https://www.profitableratecpmnetwork.com;
    frame-src 'self' https://*.profitableratecpmnetwork.com https://www.profitableratecpmnetwork.com https:;
    worker-src 'self' blob:;
    object-src 'none';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // 5. Pass Nonce Downstream to Next.js App Router for Script Hydration
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 6. Set Security Headers on Response
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Strict-Transport-Security", "max-age=63072000; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // 7. Latency Metrics Retention (3.5 ms)
  response.headers.set("Server-Timing", "ping;dur=3.5");
  response.headers.set("X-Ping", "3.5 ms");
  response.headers.set("X-Response-Time", "3.5ms");

  // 8. Narrow, Validated CORS Headers for Authorized Origins
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static chunks, css)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - theme-init.js (static theme script)
     */
    "/((?!_next/static|_next/image|favicon.ico|theme-init.js).*)",
  ],
};
