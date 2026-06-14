import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";
import { dispatchWebhook } from "@/lib/webhook";

function serialize(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    currency: "GBP",
    active: p.active,
    featured: p.featured,
    brand: p.brand ? { id: p.brand.id, slug: p.brand.slug, name: p.brand.name } : null,
    category: p.category ? { id: p.category.id, slug: p.category.slug, name: p.category.name } : null,
    variants: (p.variants ?? []).map((v: any) => ({ id: v.id, sku: v.sku, size: v.size, stock: v.stock })),
    images: (p.images ?? []).map((i: any) => ({ url: i.url, position: i.position, alt: i.alt })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function GET(req: Request) {
  const { error } = await requireScope(req, "read");
  if (error) return error;

  const url   = new URL(req.url);
  const page  = Math.max(1, Number(url.searchParams.get("page")  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const skip  = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" }, skip, take: limit,
      include: {
        brand: true, category: true,
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    }),
    db.product.count(),
  ]);

  return NextResponse.json({
    data: products.map(serialize),
    page, limit, total,
    hasMore: skip + products.length < total,
  });
}

/** Create a product. Body shape:
 * {
 *   name: string, slug?: string, description: string, priceCents: number,
 *   brandSlug: string, categorySlug: string,
 *   active?: boolean, featured?: boolean,
 *   variants: [{ size: string, sku?: string, stock?: number }, …],
 *   images?: [{ url: string, position?: number, alt?: string }, …],
 * }
 */
export async function POST(req: Request) {
  const { error } = await requireScope(req, "write");
  if (error) return error;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body?.name || !body?.brandSlug || !body?.categorySlug || typeof body?.priceCents !== "number") {
    return NextResponse.json({ error: "name, brandSlug, categorySlug, priceCents required" }, { status: 400 });
  }

  const [brand, category] = await Promise.all([
    db.brand.findUnique({ where: { slug: body.brandSlug } }),
    db.category.findUnique({ where: { slug: body.categorySlug } }),
  ]);
  if (!brand)    return NextResponse.json({ error: `Brand not found: ${body.brandSlug}` }, { status: 400 });
  if (!category) return NextResponse.json({ error: `Category not found: ${body.categorySlug}` }, { status: 400 });

  const slug = (body.slug ?? body.name)
    .toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const product = await db.product.create({
    data: {
      slug, name: body.name, description: body.description ?? "",
      priceCents: body.priceCents,
      brandId: brand.id, categoryId: category.id,
      active: body.active ?? true,
      featured: body.featured ?? false,
      variants: { create: (body.variants ?? []).map((v: any) => ({
        size: String(v.size),
        sku: v.sku ?? `${slug}-${v.size}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
        stock: typeof v.stock === "number" ? v.stock : 0,
      })) },
      images: { create: (body.images ?? []).map((i: any, idx: number) => ({
        url: String(i.url),
        key: i.key ?? `api:${slug}-${idx}`,
        alt: i.alt ?? null,
        position: typeof i.position === "number" ? i.position : idx,
      })) },
    },
    include: { brand: true, category: true, variants: true, images: { orderBy: { position: "asc" } } },
  });

  dispatchWebhook("product.created", serialize(product));
  return NextResponse.json(serialize(product), { status: 201 });
}
