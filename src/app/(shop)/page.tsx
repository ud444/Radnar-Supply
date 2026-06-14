import Link from "next/link";
import { db } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { IMG } from "@/lib/images";

export default async function Home() {
  const [featured, newest, categories, brands] = await Promise.all([
    db.product.findMany({
      where: { active: true, featured: true }, take: 8,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.product.findMany({
      where: { active: true }, orderBy: { createdAt: "desc" }, take: 4,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink/15 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20 md:pb-24 grid md:grid-cols-12 gap-10 items-stretch">
          <div className="md:col-span-7 flex flex-col justify-between gap-10">
            <div>
              <div className="rule-eyebrow">AW26 · New Drop</div>
              <h1 className="display-tight font-display font-black text-[18vw] md:text-[10.5vw] uppercase mt-6">
                Below<br/>
                <span className="text-accent">Retail.</span><br/>
                <span className="block">Always.</span>
              </h1>
              <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/75">
                Hand-picked apparel, footwear, fragrance and accessories from the houses you actually wear — without the markup. Verified, authenticated, shipped from Birmingham.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
                Shop The Drop →
              </Link>
              <Link href="/about" className="border-2 border-ink text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-colors">
                Our Story
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] bg-cream overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.hero} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-paper text-ink px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase font-bold">
                AW26 — Look 01
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE BRAND STRIP */}
      <section className="border-b border-ink/15 bg-cream overflow-hidden py-6">
        <div className="marquee-track gap-16 px-8 items-center">
          {[...brands, ...brands].map((b, i) => (
            <Link key={`${b.id}-${i}`} href={`/shop?brand=${b.slug}`}
              className="font-display font-black text-3xl md:text-4xl uppercase tracking-tightest text-ink/75 hover:text-accent shrink-0">
              {b.name}
              <span className="text-ink/25 ml-16">/</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-24">
        <div className="rule-eyebrow mb-3">Shop By Category</div>
        <h2 className="font-display font-black text-5xl md:text-6xl uppercase display-tight">
          Find your<br/>fit.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="relative aspect-[4/5] overflow-hidden group bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(IMG.category as Record<string, string>)[c.slug] ?? IMG.heroAlt} alt={c.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-paper">
                <div className="font-display font-black text-3xl md:text-4xl uppercase display-tight">{c.name}</div>
                <div className="text-[10px] tracking-[0.22em] uppercase font-bold opacity-90 group-hover:text-accent transition-colors">Shop →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-28">
        <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
          <div>
            <div className="rule-eyebrow mb-3">Most Wanted</div>
            <h2 className="font-display font-black text-5xl md:text-6xl uppercase display-tight">
              Best sellers.
            </h2>
          </div>
          <Link href="/shop" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent transition-colors">View Everything →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
          {featured.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="mt-32 bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden bg-cream/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.editorial} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-7">
            <div className="rule-eyebrow text-paper">Why Radnar</div>
            <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
              No drop hype.<br/>
              <span className="text-accent">No middlemen.</span><br/>
              Just product.
            </h2>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-paper/75">
              We negotiate stock directly with verified sources, authenticate every item in-house, and pass the saving on. Birmingham-built. Daily shipping. Designer prices, dismantled.
            </p>
            <Link href="/about" className="inline-block mt-8 bg-paper text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent hover:text-paper transition-colors">
              Read The Manifesto →
            </Link>
          </div>
        </div>
      </section>

      {/* NEW IN */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-28">
        <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
          <div>
            <div className="rule-eyebrow mb-3">Fresh Stock</div>
            <h2 className="font-display font-black text-5xl md:text-6xl uppercase display-tight">New in.</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent transition-colors">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
          {newest.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-28 grid grid-cols-1 md:grid-cols-3 gap-0 border border-ink">
        {[
          { n: "01", h: "Verified Designer", p: "Every piece authenticated in-house before it ships. No exceptions." },
          { n: "02", h: "Always Below Retail", p: "Negotiated stock, no middlemen — the saving goes to you, not the markup." },
          { n: "03", h: "Pay Your Way",       p: "Cards, Klarna, Apple Pay, PayPal. All at checkout." },
        ].map((t, i) => (
          <div key={t.h} className={`p-8 md:p-10 ${i < 2 ? "md:border-r" : ""} border-ink`}>
            <div className="font-display font-black text-5xl text-accent">{t.n}</div>
            <div className="font-display font-black text-2xl uppercase mt-4 tracking-tight">{t.h}</div>
            <div className="text-sm text-ink/75 mt-2 leading-relaxed">{t.p}</div>
          </div>
        ))}
      </section>
    </>
  );
}
