import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request) {
  const { error } = await requireScope(req, "read");
  if (error) return error;

  const variants = await db.variant.findMany({
    orderBy: { sku: "asc" },
    include: { product: { select: { id: true, slug: true, name: true, active: true } } },
  });

  return NextResponse.json({
    data: variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      stock: v.stock,
      productId: v.product.id,
      productSlug: v.product.slug,
      productName: v.product.name,
      productActive: v.product.active,
    })),
    total: variants.length,
  });
}
