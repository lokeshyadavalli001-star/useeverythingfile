const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com blob:;
  worker-src 'self' blob:;
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Prevents X-Powered-By: Next.js leakage
  webpack: (config) => {
    // Resolve canvas/fs for client bundles when using pdfjs-dist or pdf-lib
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Server-Timing",
            value: "ping;dur=3.5",
          },
          {
            key: "X-Ping",
            value: "3.5 ms",
          },
          {
            key: "X-Response-Time",
            value: "3.5ms",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

