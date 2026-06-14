import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";
import { dispatchWebhook } from "@/lib/webhook";

function serialize(p: any) {
  return {
    id: p.id, slug: p.slug, name: p.name, description: p.description,
    priceCents: p.priceCents, currency: "GBP",
    active: p.active, featured: p.featured,
    brand: p.brand ? { id: p.brand.id, slug: p.brand.slug, name: p.brand.name } : null,
    category: p.category ? { id: p.category.id, slug: p.category.slug, name: p.category.name } : null,
    variants: (p.variants ?? []).map((v: any) => ({ id: v.id, sku: v.sku, size: v.size, stock: v.stock })),
    images: (p.images ?? []).map((i: any) => ({ url: i.url, position: i.position, alt: i.alt })),
    createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireScope(req, "read");
  if (error) return error;
  const { id } = await params;
  const p = await db.product.findUnique({
    where: { id },
    include: { brand: true, category: true, variants: true, images: { orderBy: { position: "asc" } } },
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(p));
}

/** Update a product. Body accepts partial fields:
 * { name?, description?, priceCents?, brandSlug?, categorySlug?, active?, featured? }
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireScope(req, "write");
  if (error) return error;
  const { id } = await params;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const data: any = {};
  if (typeof body.name        === "string")  data.name        = body.name;
  if (typeof body.description === "string")  data.description = body.description;
  if (typeof body.priceCents  === "number")  data.priceCents  = body.priceCents;
  if (typeof body.active      === "boolean") data.active      = body.active;
  if (typeof body.featured    === "boolean") data.featured    = body.featured;
  if (typeof body.brandSlug   === "string") {
    const b = await db.brand.findUnique({ where: { slug: body.brandSlug } });
    if (!b) return NextResponse.json({ error: `Brand not found: ${body.brandSlug}` }, { status: 400 });
    data.brandId = b.id;
  }
  if (typeof body.categorySlug === "string") {
    const c = await db.category.findUnique({ where: { slug: body.categorySlug } });
    if (!c) return NextResponse.json({ error: `Category not found: ${body.categorySlug}` }, { status: 400 });
    data.categoryId = c.id;
  }

  const p = await db.product.update({
    where: { id }, data,
    include: { brand: true, category: true, variants: true, images: { orderBy: { position: "asc" } } },
  }).catch(() => null);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  dispatchWebhook("product.updated", serialize(p));
  return NextResponse.json(serialize(p));
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireScope(req, "delete");
  if (error) return error;
  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.product.delete({ where: { id } });
  dispatchWebhook("product.deleted", { id, slug: existing.slug });
  return NextResponse.json({ ok: true, id });
}
