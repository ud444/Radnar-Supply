import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://radnarsupply.com").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", disallow: ["/admin", "/account", "/api"], allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
