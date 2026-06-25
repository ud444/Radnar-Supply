import Link from "next/link";
import { db } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/shop/Reveal";
import { IMG } from "@/lib/images";

type SP = { category?: string; brand?: string; size?: string; sort?: string; q?: string };

export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sort  = sp.sort ?? "featured";
  const orderBy =
    sort === "price-asc"  ? { priceCents: "asc"  as const } :
    sort === "price-desc" ? { priceCents: "desc" as const } :
    sort === "newest"     ? { createdAt:  "desc" as const } :
                            { featured:   "desc" as const };

  const where: any = { active: true };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.brand)    where.brand    = { slug: sp.brand };
  if (sp.size)     where.variants = { some: { size: sp.size, stock: { gt: 0 } } };
  if (sp.q)        where.OR = [
    { name:        { contains: sp.q, mode: "insensitive" } },
    { description: { contains: sp.q, mode: "insensitive" } },
  ];

  const [products, categories, brands, activeCategory, activeBrand] = await Promise.all([
    db.product.findMany({ where, orderBy, include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({    orderBy: { name: "asc" } }),
    sp.category ? db.category.findUnique({ where: { slug: sp.category } }) : Promise.resolve(null),
    sp.brand    ? db.brand.findUnique({    where: { slug: sp.brand    } }) : Promise.resolve(null),
  ]);

  const ALL_SIZES = ["XS","S","M","L","XL","7","8","9","10","11","36","37","38","39","40","One Size","50ml","100ml"];

  function urlFor(merge: Partial<SP>) {
    const u = new URLSearchParams();
    const merged: SP = { ...sp, ...merge };
    Object.entries(merged).forEach(([k, v]) => { if (v) u.set(k, String(v)); });
    return `/shop${u.toString() ? `?${u}` : ""}`;
  }

  const isSearch = !!sp.q;
  const heading = isSearch
    ? `"${sp.q}"`
    : activeCategory?.name ?? activeBrand?.name ?? "Shop All";

  const categoryImage = activeCategory
    ? (IMG.category as Record<string, string>)[activeCategory.slug] ?? IMG.heroAlt
    : null;

  // Active filter chips
  const activeFilters: { label: string; href: string }[] = [];
  if (sp.q)        activeFilters.push({ label: `Search · "${sp.q}"`, href: urlFor({ q: undefined }) });
  if (sp.category) activeFilters.push({ label: `Category · ${activeCategory?.name}`, href: urlFor({ category: undefined }) });
  if (sp.brand)    activeFilters.push({ label: `Brand · ${activeBrand?.name}`, href: urlFor({ brand: undefined }) });
  if (sp.size)     activeFilters.push({ label: `Size · ${sp.size}`, href: urlFor({ size: undefined }) });

  return (
    <>
      {/* Hero band — category, brand, or search */}
      <section className="border-b border-ink/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-10 md:pb-12">
          <div className="rule-eyebrow text-ink/70">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/shop">Shop</Link>
            {activeCategory ? <><span>/</span><span className="text-ink">{activeCategory.name}</span></> : null}
            {activeBrand    ? <><span>/</span><span className="text-ink">{activeBrand.name}</span></> : null}
          </div>

          <div className="mt-6 grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              {isSearch ? (
                <div className="eyebrow-lead">Search Results</div>
              ) : activeBrand ? (
                <div className="eyebrow-lead">House Picks</div>
              ) : (
                <div className="eyebrow-lead">Drop</div>
              )}
              <h1 className="mt-3 font-display font-black text-[2.75rem] sm:text-6xl md:text-[8rem] uppercase display-tight break-words">
                {heading}.
              </h1>
              {!isSearch && !activeBrand && !activeCategory ? (
                <p className="mt-5 max-w-md text-ink/70 leading-relaxed">
                  Every piece authenticated in-house. Always below RRP. Negotiated stock from verified European sources.
                </p>
              ) : null}
            </div>

            {categoryImage ? (
              <div className="md:col-span-4 aspect-[4/5] md:aspect-[4/5] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={categoryImage} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </div>

          {/* Results count + active filters */}
          <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
            <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/65">
              {products.length} Product{products.length !== 1 ? "s" : ""}
            </div>
            {activeFilters.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {activeFilters.map((f) => (
                  <Link key={f.label} href={f.href}
                    className="inline-flex items-center gap-2 border-2 border-ink px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-bold hover:bg-ink hover:text-paper transition-colors">
                    {f.label}
                    <span>×</span>
                  </Link>
                ))}
                <Link href="/shop" className="text-[10px] tracking-[0.18em] uppercase font-bold underline text-ink/55 hover:text-accent ml-2">
                  Clear all
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 grid grid-cols-12 gap-8 md:gap-10 mt-10">
        {/* Filter sidebar */}
        <aside className="col-span-12 md:col-span-3 text-sm">
          <div className="md:sticky md:top-28">
            <form action="/shop" className="mb-4 md:mb-8 relative">
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              {sp.brand    && <input type="hidden" name="brand"    value={sp.brand} />}
              {sp.size     && <input type="hidden" name="size"     value={sp.size} />}
              {sp.sort     && <input type="hidden" name="sort"     value={sp.sort} />}
              <input name="q" defaultValue={sp.q ?? ""} placeholder="Search products…"
                className="w-full bg-bone border-2 border-ink/20 px-3 py-3 text-base focus:outline-none focus:border-ink" />
            </form>

            {/* Collapsible on mobile via native <details>; forced-open on desktop (md:!block beats
                the UA "details:not([open])>* { display:none }" rule, so the summary toggle is moot there). */}
            <details className="group border-2 border-ink md:border-0 mb-6 md:mb-0">
              <summary className="md:hidden flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none text-[11px] tracking-[0.22em] uppercase font-bold">
                Filters &amp; Sort
                <span className="text-xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="md:!block px-4 pb-4 md:p-0">

            <Section title="Sort">
              {[
                ["featured",    "Featured"],
                ["newest",      "Newest"],
                ["price-asc",   "Price · Low to High"],
                ["price-desc",  "Price · High to Low"],
              ].map(([v, l]) => (
                <Item key={v} href={urlFor({ sort: v })} active={sort === v}>{l}</Item>
              ))}
            </Section>

            <Section title="Category">
              <Item href={urlFor({ category: undefined })} active={!sp.category}>All</Item>
              {categories.map((c) => (
                <Item key={c.id} href={urlFor({ category: c.slug })} active={sp.category === c.slug}>{c.name}</Item>
              ))}
            </Section>

            <Section title="Brand">
              <Item href={urlFor({ brand: undefined })} active={!sp.brand}>All</Item>
              {brands.map((b) => (
                <Item key={b.id} href={urlFor({ brand: b.slug })} active={sp.brand === b.slug}>{b.name}</Item>
              ))}
            </Section>

            <Section title="Size">
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5">
                <Link href={urlFor({ size: undefined })} className={`text-[12px] px-2 py-2.5 border-2 text-center font-bold uppercase tracking-wider ${!sp.size ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink/70 hover:border-ink"}`}>All</Link>
                {ALL_SIZES.map((s) => (
                  <Link key={s} href={urlFor({ size: s })} className={`text-[12px] px-2 py-2.5 border-2 text-center font-bold uppercase tracking-wider ${sp.size === s ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink/70 hover:border-ink"}`}>{s}</Link>
                ))}
              </div>
            </Section>
              </div>
            </details>
          </div>
        </aside>

        {/* Products */}
        <section className="col-span-12 md:col-span-9">
          {products.length === 0 ? (
            <div className="card-frame py-20 text-center">
              <div className="num-mark mb-3">·</div>
              <h2 className="font-display font-black uppercase text-3xl md:text-5xl tracking-tight display-tight">
                Nothing matches.
              </h2>
              <p className="mt-3 text-sm text-ink/65 max-w-sm mx-auto">
                {isSearch
                  ? <>No products matched <span className="font-medium text-ink">"{sp.q}"</span>. Try a different search or clear filters.</>
                  : <>Try clearing some filters or browse all products.</>}
              </p>
              <Link href="/shop" className="btn mt-6 inline-flex">Browse Everything →</Link>
            </div>
          ) : (
            <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12">
              {products.map((p) => <ProductCard key={p.id} {...p} />)}
            </Reveal>
          )}
        </section>
      </div>

      {/* Bottom strip — encourage exploration */}
      {products.length > 0 ? (
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 mt-24 mb-8 border-t border-ink/15 pt-10">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <Link href="/about" className="group">
              <div className="num-mark">01</div>
              <div className="font-display font-black uppercase text-xl tracking-tight mt-1 group-hover:text-accent">Why Radnar</div>
              <div className="text-[12px] text-ink/65 mt-1">Verified. Negotiated. Below RRP.</div>
            </Link>
            <Link href="/policies/returns" className="group">
              <div className="num-mark">02</div>
              <div className="font-display font-black uppercase text-xl tracking-tight mt-1 group-hover:text-accent">30-Day Returns</div>
              <div className="text-[12px] text-ink/65 mt-1">Free UK pre-paid label.</div>
            </Link>
            <Link href="/policies/shipping" className="group">
              <div className="num-mark">03</div>
              <div className="font-display font-black uppercase text-xl tracking-tight mt-1 group-hover:text-accent">Free Over £75</div>
              <div className="text-[12px] text-ink/65 mt-1">2–4 working days, tracked.</div>
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold mb-3 pb-2 border-b border-ink">{title}</div>
      {children}
    </div>
  );
}
function Item({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`block py-1.5 text-[13px] ${active ? "text-accent font-bold" : "text-ink/75 hover:text-ink"}`}>
      {children}
    </Link>
  );
}
