import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { AddToCartForm } from "./AddToCartForm";
import { ProductCard } from "@/components/shop/ProductCard";

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

  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    take: 4, include: { brand: true, images: { take: 2, orderBy: { position: "asc" } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <div className="text-[11px] tracking-[0.16em] uppercase text-muted">
        <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp;
        <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link> &nbsp;/&nbsp;
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12 mt-5">
        <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-3">
          {product.images.map((img, i) => (
            <div key={img.id} className={`aspect-[4/5] bg-soft overflow-hidden rounded ${i === 0 ? "col-span-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? product.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <aside className="col-span-12 md:col-span-5 md:sticky md:top-24 self-start">
          <Link href={`/shop?brand=${product.brand.slug}`} className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink">
            {product.brand.name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tightest mt-1">{product.name}</h1>
          <div className="mt-4 text-2xl font-semibold">{money(product.priceCents)}</div>
          <div className="text-xs text-muted mt-1">or 3 interest-free payments with Klarna</div>

          <AddToCartForm variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))} />

          <div className="mt-10 border-t border-line pt-6 text-sm leading-relaxed">{product.description}</div>

          <ul className="mt-6 space-y-2 text-sm">
            <li>· Verified designer — authenticated in-house</li>
            <li>· Free UK delivery over £75 · 30-day returns</li>
            <li>· Klarna, Apple Pay, PayPal at checkout</li>
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xl font-display font-semibold tracking-tightest mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
