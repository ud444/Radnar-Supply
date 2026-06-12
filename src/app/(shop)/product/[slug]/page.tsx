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
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-10">
      <div className="rule-eyebrow text-ink/70">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/shop">Shop</Link><span>/</span>
        <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12 mt-6">
        <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-3">
          {product.images.map((img, i) => (
            <div key={img.id} className={`aspect-[4/5] bg-cream overflow-hidden ${i === 0 ? "col-span-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? product.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <aside className="col-span-12 md:col-span-5 md:sticky md:top-32 self-start">
          <Link href={`/shop?brand=${product.brand.slug}`}
            className="font-display font-black text-2xl uppercase tracking-tight text-ink hover:text-accent transition-colors">
            {product.brand.name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mt-2">{product.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="font-display font-black text-3xl">{money(product.priceCents)}</div>
          </div>
          <div className="text-xs text-ink/65 mt-1 tracking-wider uppercase">or 3 interest-free payments with Klarna</div>

          <AddToCartForm variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))} />

          <div className="mt-10 border-t border-ink/15 pt-6 text-sm leading-relaxed">{product.description}</div>

          <ul className="mt-8 grid grid-cols-1 gap-2.5 text-[12px] tracking-[0.06em]">
            {[
              "Verified Designer · Authenticated In-House",
              "Free UK Delivery Over £75 · 30-Day Returns",
              "Klarna · Apple Pay · PayPal at Checkout",
            ].map((s) => (
              <li key={s} className="flex items-start gap-3 border-l-2 border-accent pl-3 py-1 uppercase font-semibold">{s}</li>
            ))}
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <div className="rule-eyebrow mb-3">More like this</div>
          <h2 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mb-8">You might also like.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {related.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
