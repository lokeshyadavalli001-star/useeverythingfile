import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://useeverythingfile.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin-test", "/internal-status"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
