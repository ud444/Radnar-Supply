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
    db.product.findMany({
      where, orderBy,
      include: { brand: true, images: { orderBy: { position: "asc" }, take: 2 } },
    }),
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

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="text-[11px] tracking-[0.16em] uppercase text-muted">
        <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link>
        {sp.category ? <> &nbsp;/&nbsp; <span className="text-ink">{categories.find((c) => c.slug === sp.category)?.name}</span></> : null}
      </div>
      <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tightest">{sp.category ? categories.find((c) => c.slug === sp.category)?.name : "Shop all"}</h1>
        <div className="text-sm text-muted">{products.length} products</div>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-8">
        <aside className="col-span-12 md:col-span-3 text-sm">
          <form action="/shop" className="mb-6">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.brand    && <input type="hidden" name="brand"    value={sp.brand} />}
            {sp.size     && <input type="hidden" name="size"     value={sp.size} />}
            {sp.sort     && <input type="hidden" name="sort"     value={sp.sort} />}
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search…" className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-ink" />
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
              <Link href={urlFor({ size: undefined })} className={`text-xs px-2 py-1.5 border rounded text-center ${!sp.size ? "border-ink" : "border-line text-muted hover:border-ink"}`}>All</Link>
              {ALL_SIZES.map((s) => (
                <Link key={s} href={urlFor({ size: s })} className={`text-xs px-2 py-1.5 border rounded text-center ${sp.size === s ? "border-ink" : "border-line text-muted hover:border-ink"}`}>{s}</Link>
              ))}
            </div>
          </Section>

          <Section title="Sort">
            {[
              ["featured",    "Featured"],
              ["newest",      "Newest"],
              ["price-asc",   "Price · Low to high"],
              ["price-desc",  "Price · High to low"],
            ].map(([v, l]) => (
              <Item key={v} href={urlFor({ sort: v })} active={sort === v}>{l}</Item>
            ))}
          </Section>
        </aside>

        <section className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
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
    <div className="mb-7">
      <div className="text-[11px] tracking-[0.18em] uppercase text-muted mb-2">{title}</div>
      {children}
    </div>
  );
}
function Item({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`block py-1 ${active ? "text-ink font-medium" : "text-muted hover:text-ink"}`}>
      {children}
    </Link>
  );
}
