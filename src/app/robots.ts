import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ispace.uz";

export default function robots(): MetadataRoute.Robots {
  return {
    // `/admin` va API — ichki vositalar, indekslanmasin.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
