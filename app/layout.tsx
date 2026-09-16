import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && supportDark) || (stored === 'system' && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-950 text-surface-200 antialiased selection:bg-red-500/30 selection:text-red-300">
        <ThemeProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
