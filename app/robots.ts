import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beercade.com.au";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/api/", "/thanks", "/print/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
