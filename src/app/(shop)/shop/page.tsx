import Link from "next/link";
import { db } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

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

  const [products, categories, brands] = await Promise.all([
    db.product.findMany({ where, orderBy, include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({    orderBy: { name: "asc" } }),
  ]);

  const ALL_SIZES = ["XS","S","M","L","XL","7","8","9","10","11","36","37","38","39","40","One Size","50ml","100ml"];

  function urlFor(merge: Partial<SP>) {
    const u = new URLSearchParams();
    const merged: SP = { ...sp, ...merge };
    Object.entries(merged).forEach(([k, v]) => { if (v) u.set(k, String(v)); });
    return `/shop${u.toString() ? `?${u}` : ""}`;
  }

  const heading = sp.q ? `"${sp.q}"` : sp.category ? categories.find((c) => c.slug === sp.category)?.name : "Shop All";

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10">
      <div className="rule-eyebrow text-ink/70">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        {sp.category ? <><span>/</span><span className="text-ink">{categories.find((c) => c.slug === sp.category)?.name}</span></> : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 flex-wrap">
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase display-tight">{heading}</h1>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/70">{products.length} Products</div>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-10">
        <aside className="col-span-12 md:col-span-3 text-sm">
          <form action="/shop" className="mb-8">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.brand    && <input type="hidden" name="brand"    value={sp.brand} />}
            {sp.size     && <input type="hidden" name="size"     value={sp.size} />}
            {sp.sort     && <input type="hidden" name="sort"     value={sp.sort} />}
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search…" className="w-full bg-cream border-2 border-ink px-3 py-3 text-sm focus:outline-none focus:border-accent" />
          </form>

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
            <div className="grid grid-cols-3 gap-1.5">
              <Link href={urlFor({ size: undefined })} className={`text-[11px] px-2 py-1.5 border-2 text-center font-bold uppercase tracking-wider ${!sp.size ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink/70 hover:border-ink"}`}>All</Link>
              {ALL_SIZES.map((s) => (
                <Link key={s} href={urlFor({ size: s })} className={`text-[11px] px-2 py-1.5 border-2 text-center font-bold uppercase tracking-wider ${sp.size === s ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink/70 hover:border-ink"}`}>{s}</Link>
              ))}
            </div>
          </Section>

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
        </aside>

        <section className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12">
          {products.length === 0
            ? <div className="col-span-full text-muted text-sm py-12 text-center">Nothing matches those filters.</div>
            : products.map((p) => <ProductCard key={p.id} {...p} />)}
        </section>
      </div>
    </div>
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
