import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { AddToCartForm } from "./AddToCartForm";
import { ProductGallery } from "./ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/shop/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: { brand: true, images: true } });
  if (!p) return {};
  return {
    title: `${p.name} — ${p.brand.name}`,
    description: p.description,
    openGraph: { images: p.images[0]?.url ? [p.images[0].url] : [] },
  };
}

export default async function PDP({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true, category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });
  if (!product) notFound();

  const totalStock = product.variants.reduce((a, v) => a + v.stock, 0);
  const allSizesOOS = totalStock === 0;

  const [related, moreFromBrand] = await Promise.all([
    db.product.findMany({
      where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
      take: 4, include: { brand: true, images: { take: 2, orderBy: { position: "asc" } } },
    }),
    db.product.findMany({
      where: { active: true, brandId: product.brandId, id: { not: product.id } },
      take: 4, include: { brand: true, images: { take: 2, orderBy: { position: "asc" } } },
    }),
  ]);

  const skuPreview = product.variants[0]?.sku ?? product.slug.toUpperCase();

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-10">
      {/* Breadcrumb */}
      <div className="rule-eyebrow text-ink/70 mb-2">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/shop">Shop</Link><span>/</span>
        <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
      </div>

      {/* Main */}
      <div className="grid grid-cols-12 gap-8 md:gap-12 mt-4">
        {/* Gallery */}
        <div className="col-span-12 md:col-span-7">
          <ProductGallery
            images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
            name={product.name}
          />
        </div>

        {/* Buy box */}
        <aside className="col-span-12 md:col-span-5 md:sticky md:top-28 self-start">
          <Link href={`/shop?brand=${product.brand.slug}`}
            className="eyebrow-lead text-ink hover:text-accent transition-colors">
            {product.brand.name}
          </Link>

          <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase tracking-tight leading-[0.95]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline justify-between border-y border-ink/15 py-4">
            <div>
              <div className="font-display font-black text-4xl tracking-tightest leading-none">{money(product.priceCents)}</div>
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mt-1.5">Inc. VAT · Below RRP</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Klarna</div>
              <div className="text-sm font-display font-bold mt-1">3 × {money(Math.round(product.priceCents / 3))}</div>
            </div>
          </div>

          {/* Size selector + add to bag */}
          <AddToCartForm
            variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))}
            allOOS={allSizesOOS}
            productName={product.name}
            price={money(product.priceCents)}
          />

          {/* Reassurance bullets */}
          <ul className="mt-8 space-y-3">
            {[
              { h: "Verified Designer",   p: "Authenticated in-house before dispatch." },
              { h: "Free UK Delivery",    p: "Over £75. 2–4 working days. Tracked." },
              { h: "30-Day Free Returns", p: "Pre-paid label. Unworn with tags." },
            ].map((b, i) => (
              <li key={b.h} className="flex items-start gap-4 border-b border-ink/10 pb-3">
                <span className="num-mark mt-1">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-[12px] tracking-[0.12em] uppercase font-bold">{b.h}</div>
                  <div className="text-[12px] text-ink/65 mt-0.5">{b.p}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* Style code */}
          <div className="mt-6 text-[10px] tracking-[0.22em] uppercase font-bold text-ink/45">
            Style · <span className="font-mono">{skuPreview}</span>
          </div>
        </aside>
      </div>

      {/* Editorial details — accordions */}
      <Reveal as="section" className="mt-24 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="eyebrow-lead">The Detail</div>
          <h2 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Know what<br/>you're wearing.</h2>
        </div>
        <div className="md:col-span-8 divide-y-2 divide-ink/10 border-y-2 border-ink/10">
          {[
            { h: "Description",          body: product.description, open: true },
            { h: "Materials & Care",     body: "Materials and care instructions will appear here once added in the admin product detail. For now, please refer to the manufacturer's tag." },
            { h: "Delivery & Returns",   body: "Free UK delivery over £75. Standard tracked 2–4 working days · £4.95. Express options at checkout. 30-day free returns for unworn items with tags." },
            { h: "Authentication",       body: "Every Radnar Supply piece is sourced from verified European partners and authenticated in-house. If you believe an item is not authentic, contact hello@radnarsupply.com for a full refund." },
          ].map((s) => (
            <details key={s.h} open={!!s.open} className="py-5 group">
              <summary className="cursor-pointer list-none flex justify-between items-center gap-4">
                <span className="font-display font-black uppercase text-xl tracking-tight">{s.h}</span>
                <span className="text-ink/40 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80 max-w-prose">{s.body}</p>
            </details>
          ))}
        </div>
      </Reveal>

      {/* More from brand */}
      {moreFromBrand.length > 0 && (
        <Reveal as="section" className="mt-24 border-t-2 border-ink/10 pt-16">
          <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
            <div>
              <div className="eyebrow-lead">House Picks</div>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl uppercase display-tight">More from {product.brand.name}.</h2>
            </div>
            <Link href={`/shop?brand=${product.brand.slug}`} className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">
              Shop the brand →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {moreFromBrand.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </Reveal>
      )}

      {/* Related (same category, different brand) */}
      {related.length > 0 && (
        <Reveal as="section" className="mt-24 pt-16 border-t-2 border-ink/10">
          <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
            <div>
              <div className="eyebrow-lead">Cross-Pollinate</div>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl uppercase display-tight">You might also like.</h2>
            </div>
            <Link href={`/shop?category=${product.category.slug}`} className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">
              All {product.category.name} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {related.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </Reveal>
      )}

      {/* Clearance for the sticky mobile buy-bar */}
      <div className="h-24 md:hidden" aria-hidden />
    </div>
  );
}
