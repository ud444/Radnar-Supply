import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request) {
  const { error } = await requireScope(req, "products.read");
  if (error) return error;

  const url   = new URL(req.url);
  const page  = Math.max(1, Number(url.searchParams.get("page")  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const skip  = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      skip, take: limit,
      include: {
        brand: { select: { slug: true, name: true } },
        category: { select: { slug: true, name: true } },
        variants: { select: { id: true, sku: true, size: true, stock: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, position: true } },
      },
    }),
    db.product.count(),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      currency: "GBP",
      active: p.active,
      featured: p.featured,
      brand: p.brand,
      category: p.category,
      variants: p.variants,
      images: p.images,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    page, limit, total,
    hasMore: skip + products.length < total,
  });
}
