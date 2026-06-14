import type { MetadataRoute } from "next";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://radnarsupply.com").replace(/\/$/, "");
  const products = await db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
  return [
    { url: `${base}/`,         changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`,     changeFrequency: "daily",  priority: 0.9 },
    { url: `${base}/about`,    changeFrequency: "monthly", priority: 0.4 },
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
