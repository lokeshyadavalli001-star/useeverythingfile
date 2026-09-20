import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Everything File — One place for every file problem",
  description:
    "Convert. Compress. Organize. Protect. Free, browser-first file utility platform with 100% privacy and zero file uploads for standard tools.",
  keywords: [
    "file converter",
    "pdf tools",
    "compress pdf",
    "merge pdf",
    "pdf to word",
    "word to pdf",
    "image converter",
    "compress image",
    "resize image",
    "private pdf",
  ],
  authors: [{ name: "Everything File" }],
  robots: "index, follow",
  openGraph: {
    title: "Everything File — One place for every file problem",
    description: "Convert. Compress. Organize. Protect. Browser-first privacy file utility platform.",
    type: "website",
    locale: "en_US",
    siteName: "Everything File",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script src="/theme-init.js" nonce={nonce} />
        <script
          async
          src="https://pl31435145.profitableratecpmnetwork.com/07/e1/48/07e1481f0901a9724f0b126a97bd39cc.js"
          nonce={nonce}
        />
        <script
          async
          src="https://pl31435147.profitableratecpmnetwork.com/72/b3/55/72b35598045419c9a3a3b2875d6fd90e.js"
          nonce={nonce}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-950 text-surface-200 antialiased selection:bg-red-500/30 selection:text-red-300">
        <ThemeProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
