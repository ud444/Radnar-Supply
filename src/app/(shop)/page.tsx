import Link from "next/link";
import { db } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function Home() {
  const [featured, newest, categories] = await Promise.all([
    db.product.findMany({
      where: { active: true, featured: true }, take: 8,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.product.findMany({
      where: { active: true }, orderBy: { createdAt: "desc" }, take: 4,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-soft border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-muted mb-5">AW26 · New Drop</div>
            <h1 className="hero-h font-display font-semibold text-[44px] md:text-[76px]">
              Verified<br/>designer.<br/>Always <em className="not-italic text-muted">below retail.</em>
            </h1>
            <p className="mt-6 max-w-md text-muted leading-relaxed">
              Hand-picked apparel, footwear, fragrance and accessories from the houses you actually wear — without the markup. Out of Birmingham, UK.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/shop" className="bg-ink text-white px-6 py-3 text-sm font-medium rounded-full hover:bg-ink/85 transition-colors">Shop the drop</Link>
              <Link href="/about" className="border border-ink text-ink px-6 py-3 text-sm font-medium rounded-full hover:bg-ink hover:text-white transition-colors">Our story</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-white rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/radnar-hero-aw26/1000/1250" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="relative aspect-[4/5] overflow-hidden rounded group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://picsum.photos/seed/${c.slug}-${i}/700/875`} alt={c.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-lg font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Best Sellers</div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tightest mt-1">Most loved this season</h2>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {featured.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* New In */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tightest">New In</h2>
          <Link href="/shop?sort=newest" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {newest.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-6 mt-24 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { h: "Verified designer", p: "Every piece authenticated in-house before it ships." },
          { h: "Always below retail", p: "Negotiated stock, no middlemen — savings passed to you." },
          { h: "Pay your way", p: "Cards, Klarna, Apple Pay, PayPal — all at checkout." },
        ].map((t) => (
          <div key={t.h} className="border border-line rounded p-6">
            <div className="text-sm font-semibold text-ink">{t.h}</div>
            <div className="text-sm text-muted mt-1">{t.p}</div>
          </div>
        ))}
      </section>
    </>
  );
}
