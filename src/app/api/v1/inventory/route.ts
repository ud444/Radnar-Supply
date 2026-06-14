import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request) {
  const { error } = await requireScope(req, "inventory.read");
  if (error) return error;

  const variants = await db.variant.findMany({
    orderBy: { sku: "asc" },
    include: { product: { select: { slug: true, name: true, active: true } } },
  });

  return NextResponse.json({
    data: variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      stock: v.stock,
      productSlug: v.product.slug,
      productName: v.product.name,
      productActive: v.product.active,
    })),
    total: variants.length,
  });
}

/** Bulk stock update. Body: { updates: [{ sku, stock }, ...] } */
export async function PATCH(req: Request) {
  const { error } = await requireScope(req, "inventory.write");
  if (error) return error;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const updates: { sku: string; stock: number }[] = Array.isArray(body?.updates) ? body.updates : [];
  if (updates.length === 0) return NextResponse.json({ error: "updates[] required" }, { status: 400 });

  const results: { sku: string; ok: boolean; stock?: number; error?: string }[] = [];
  for (const u of updates) {
    if (typeof u.sku !== "string" || typeof u.stock !== "number" || u.stock < 0) {
      results.push({ sku: String(u?.sku), ok: false, error: "Invalid sku or stock" });
      continue;
    }
    try {
      const v = await db.variant.update({ where: { sku: u.sku }, data: { stock: Math.floor(u.stock) } });
      results.push({ sku: v.sku, ok: true, stock: v.stock });
    } catch (e: any) {
      results.push({ sku: u.sku, ok: false, error: e.code === "P2025" ? "SKU not found" : "Update failed" });
    }
  }

  return NextResponse.json({ results });
}
