import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://useeverythingfile.vercel.app";

  const routes = [
    "",
    "/compress-file",
    "/compress-pdf",
    "/compress-pdf-to-500kb",
    "/compress-pdf-to-1mb",
    "/compress-image",
    "/crop-image",
    "/resize-image",
    "/merge-pdf",
    "/split-pdf",
    "/rotate-pdf",
    "/delete-pdf-pages",
    "/extract-pdf-pages",
    "/reorder-pdf",
    "/pdf-to-text",
    "/pdf-to-word",
    "/word-to-pdf",
    "/pdf-to-jpg",
    "/image-to-pdf",
    "/jpg-to-pdf",
    "/jpg-to-png",
    "/png-to-jpg",
    "/jpg-to-webp",
    "/webp-to-jpg",
    "/about",
    "/how-it-works",
    "/privacy",
    "/terms",
    "/security",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route.includes("compress") ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.includes("compress") || route.includes("pdf") ? 0.9 : 0.7,
  }));
}
