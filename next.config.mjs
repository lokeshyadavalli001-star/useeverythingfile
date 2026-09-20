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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.useeverythingfile.vercel.app",
          },
        ],
        destination: "https://useeverythingfile.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; preload",
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
