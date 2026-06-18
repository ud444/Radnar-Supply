import Link from "next/link";
import { db } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { CircularBadge } from "@/components/shop/CircularBadge";
import { getHomeContent, getHomeMedia, categoryImage } from "@/lib/content";

// Render a title string that may contain newlines, accenting the final line.
function MultilineTitle({ value }: { value: string }) {
  const lines = value.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={i === lines.length - 1 && lines.length > 1 ? "block text-accent" : "block"}>
          {line}
        </span>
      ))}
    </>
  );
}

export default async function Home() {
  const [featured, newest, categories, brands, content, media] = await Promise.all([
    db.product.findMany({
      where: { active: true, featured: true }, take: 4,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.product.findMany({
      where: { active: true }, orderBy: { createdAt: "desc" }, take: 4,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    getHomeContent(),
    getHomeMedia(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink/15 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20 md:pb-24 grid md:grid-cols-12 gap-10 items-stretch">
          <div className="md:col-span-7 flex flex-col justify-between gap-10">
            <div>
              <div className="rule-eyebrow">{content.heroEyebrow}</div>
              <h1 className="display-tight font-display font-black text-[15vw] md:text-[8.5vw] uppercase mt-6">
                <MultilineTitle value={content.heroTitle} />
              </h1>
              <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/75">
                {content.heroBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={content.heroPrimaryHref} className="bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
                {content.heroPrimaryLabel} →
              </Link>
              <Link href={content.heroSecondaryHref} className="border-2 border-ink text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-colors">
                {content.heroSecondaryLabel}
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] bg-cream overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.hero} alt="" className="w-full h-full object-cover" />
              <div className="absolute -bottom-6 -left-6 md:bottom-auto md:top-4 md:-left-10 bg-paper text-ink w-[120px] h-[120px] grid place-items-center border border-ink/15">
                <CircularBadge size={108} />
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

      {/* PERSONAL SHOPPING */}
      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="rule-eyebrow text-paper">{content.personalEyebrow}</div>
            <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
              <MultilineTitle value={content.personalTitle} />
            </h2>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-paper/75">
              {content.personalBody}
            </p>
            <Link href="/sourcing" className="inline-block mt-8 bg-paper text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent hover:text-paper transition-colors">
              {content.personalCtaLabel} →
            </Link>
          </div>
          <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden bg-cream/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.personal} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-24">
        <div className="rule-eyebrow mb-3">Shop The Stock</div>
        <h2 className="font-display font-black text-5xl md:text-6xl uppercase display-tight">
          Shop by<br/>category.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="relative aspect-[4/5] overflow-hidden group bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={categoryImage(media, c.slug)} alt={c.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-paper">
                <div className="font-display font-black text-3xl md:text-4xl uppercase display-tight">{c.name}</div>
                <div className="text-[10px] tracking-[0.22em] uppercase font-bold opacity-90 group-hover:text-accent transition-colors">Shop →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED — single product rail */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-28">
        <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
          <div>
            <div className="rule-eyebrow mb-3">In Stock Now</div>
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

      {/* RADNAR PRIVATE — luxury division */}
      <section className="mt-28 border-y border-ink/15 bg-cream">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 relative aspect-[5/6] overflow-hidden bg-ink/5 order-2 md:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.private} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-ink text-paper px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase font-bold">
              Enquiry Only
            </div>
          </div>
          <div className="md:col-span-7 order-1 md:order-2">
            <div className="rule-eyebrow">{content.privateEyebrow}</div>
            <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
              <MultilineTitle value={content.privateTitle} />
            </h2>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink/75">
              {content.privateBody}
            </p>
            <Link href="/sourcing?type=private" className="inline-block mt-8 bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
              {content.privateCtaLabel} →
            </Link>
          </div>
        </div>
      </section>

      {/* NEW IN — secondary product rail */}
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

      {/* WHY RADNAR — trust */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 mt-28 mb-4">
        <div className="rule-eyebrow mb-3">Why Radnar</div>
        <h2 className="font-display font-black text-5xl md:text-6xl uppercase display-tight mb-10">
          {content.whyTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border border-ink">
          {content.whyItems.map((t, i) => (
            <div key={t.h} className={`p-6 md:p-7 border-ink ${i < content.whyItems.length - 1 ? "border-b sm:border-b lg:border-b-0 lg:border-r" : ""}`}>
              <div className="font-display font-black text-3xl text-accent">{String(i + 1).padStart(2, "0")}</div>
              <div className="font-display font-black text-lg uppercase mt-3 tracking-tight leading-tight">{t.h}</div>
              <div className="text-[13px] text-ink/75 mt-2 leading-relaxed">{t.p}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
