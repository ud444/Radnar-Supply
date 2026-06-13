"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Item = { id: string; slug: string; name: string };
type Feat = { id: string; slug: string; name: string; imageUrl: string; brandName: string };

const TOP_NAV = [
  { key: "clothing",    label: "Clothing"    },
  { key: "shoes",       label: "Shoes"       },
  { key: "accessories", label: "Accessories" },
  { key: "fragrance",   label: "Fragrance"   },
  { key: "brands",      label: "Brands"      },
];

export function HeaderNav({
  categories, brands, featured, cartCount, signedIn,
}: {
  categories: Item[]; brands: Item[]; featured: Feat[];
  cartCount: number; signedIn: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const enter = (k: string) => {
    if (closeT.current) clearTimeout(closeT.current);
    setOpen(k);
  };
  const leave = () => {
    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = setTimeout(() => setOpen(null), 120);
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); setSearch(false); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") || "").trim();
    setSearch(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <>
      {/* Main bar */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobile(true)} className="md:hidden p-2 -ml-2" aria-label="Open menu">
            <span className="block w-5 h-[2px] bg-ink mb-1.5" />
            <span className="block w-5 h-[2px] bg-ink mb-1.5" />
            <span className="block w-5 h-[2px] bg-ink" />
          </button>
          <Link href="/" className="shrink-0">
            <Image src="/radnar-mark.png" alt="Radnar Supply" width={1600} height={535} priority className="h-9 md:h-10 w-auto" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase font-semibold" onMouseLeave={leave}>
          {TOP_NAV.map((n) => (
            <button key={n.key} onMouseEnter={() => enter(n.key)} onFocus={() => enter(n.key)}
              className={`relative py-2 transition-colors ${open === n.key ? "text-accent" : "hover:text-accent"}`}>
              {n.label}
              {open === n.key ? <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent" /> : null}
            </button>
          ))}
          <Link href="/shop" className="py-2 hover:text-accent">Shop All</Link>
        </nav>

        <div className="flex items-center gap-4 text-[11px] tracking-[0.18em] uppercase font-semibold">
          <button onClick={() => setSearch((s) => !s)} className="hover:text-accent hidden sm:inline-flex items-center gap-1.5" aria-label="Search">
            <SearchIcon /> <span className="hidden md:inline">Search</span>
          </button>
          <Link href={signedIn ? "/account" : "/login"} className="hidden sm:inline hover:text-accent">
            {signedIn ? "Account" : "Sign In"}
          </Link>
          <Link href="/cart" className="bg-ink text-paper px-3 py-2 inline-flex items-center gap-2 hover:bg-accent transition-colors">
            <span>Bag</span>
            <span className="bg-paper text-ink min-w-[20px] h-[20px] inline-flex items-center justify-center text-[10px] font-bold">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Search bar drawer */}
      {search ? (
        <div className="border-t border-ink/15 bg-paper">
          <form onSubmit={submitSearch} className="max-w-[1400px] mx-auto px-5 md:px-8 py-5 flex gap-3">
            <input
              autoFocus name="q" type="search" placeholder="Search products, brands, sizes…"
              className="flex-1 bg-transparent border-b-2 border-ink text-[18px] md:text-2xl font-display font-bold uppercase tracking-tight py-2 focus:outline-none placeholder:text-ink/30"
            />
            <button className="bg-ink text-paper px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">Go →</button>
            <button type="button" onClick={() => setSearch(false)} className="text-ink/50 text-[11px] tracking-[0.22em] uppercase font-bold hover:text-ink">Close</button>
          </form>
        </div>
      ) : null}

      {/* Desktop mega-menu */}
      {open ? (
        <div className="hidden md:block border-t border-ink/15 bg-paper shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18)]" onMouseEnter={() => enter(open)} onMouseLeave={leave}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 grid grid-cols-12 gap-10">
            {open === "brands" ? (
              <>
                <div className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
                  {brands.map((b) => (
                    <Link key={b.id} href={`/shop?brand=${b.slug}`}
                      className="font-display font-black text-2xl uppercase tracking-tight text-ink hover:text-accent py-1">
                      {b.name}
                    </Link>
                  ))}
                </div>
                <div className="col-span-4">
                  <FeaturedPanel featured={featured} />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-3">
                  <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-4">Shop</div>
                  <ul className="space-y-2 text-sm">
                    <li><Link href={`/shop?category=${open}`} className="hover:text-accent text-ink font-bold">Shop All {labelFor(open)}</Link></li>
                    <li><Link href={`/shop?category=${open}&sort=newest`} className="hover:text-accent">New In</Link></li>
                    <li><Link href={`/shop?category=${open}&sort=price-desc`} className="hover:text-accent">Hero Pieces</Link></li>
                    <li><Link href={`/shop?category=${open}&sort=price-asc`} className="hover:text-accent">Under £100</Link></li>
                  </ul>
                </div>
                <div className="col-span-3">
                  <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-4">Brands</div>
                  <ul className="space-y-2 text-sm">
                    {brands.slice(0, 6).map((b) => (
                      <li key={b.id}><Link href={`/shop?category=${open}&brand=${b.slug}`} className="hover:text-accent">{b.name}</Link></li>
                    ))}
                    <li><Link href="#" onMouseEnter={() => enter("brands")} className="text-accent font-bold">All Brands →</Link></li>
                  </ul>
                </div>
                <div className="col-span-6">
                  <FeaturedPanel featured={featured} />
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Mobile drawer */}
      {mobile ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobile(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[88vw] max-w-sm bg-paper p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <Image src="/radnar-mark.png" alt="" width={1600} height={535} className="h-8 w-auto" />
              <button onClick={() => setMobile(false)} className="text-[11px] tracking-[0.22em] uppercase font-bold">Close</button>
            </div>
            <form onSubmit={submitSearch} className="mb-8">
              <input name="q" placeholder="Search…" className="w-full bg-cream border-2 border-ink px-3 py-3 text-sm focus:outline-none focus:border-accent" />
            </form>
            {TOP_NAV.map((n) => (
              <div key={n.key} className="border-b border-ink/15 py-3">
                <Link href={n.key === "brands" ? "/shop" : `/shop?category=${n.key}`} onClick={() => setMobile(false)}
                  className="font-display font-black text-3xl uppercase tracking-tight hover:text-accent">{n.label}</Link>
              </div>
            ))}
            <Link href="/shop" onClick={() => setMobile(false)} className="block py-3 font-display font-black text-3xl uppercase tracking-tight hover:text-accent border-b border-ink/15">Shop All</Link>
            <div className="mt-8 space-y-3 text-[12px] tracking-[0.18em] uppercase font-semibold">
              <Link href={signedIn ? "/account" : "/login"} onClick={() => setMobile(false)} className="block hover:text-accent">{signedIn ? "Account" : "Sign In"}</Link>
              <Link href="/about" onClick={() => setMobile(false)} className="block hover:text-accent">About</Link>
              <Link href="/policies/shipping" onClick={() => setMobile(false)} className="block hover:text-accent">Help & Policies</Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function labelFor(slug: string) {
  return ({ clothing: "Clothing", shoes: "Shoes", accessories: "Accessories", fragrance: "Fragrance" } as Record<string, string>)[slug] ?? "";
}

function FeaturedPanel({ featured }: { featured: Feat[] }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-4">Featured</div>
      <div className="grid grid-cols-2 gap-3">
        {featured.slice(0, 4).map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="group block">
            <div className="aspect-[4/5] bg-cream overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
            </div>
            <div className="mt-2 text-[10px] tracking-[0.18em] uppercase font-bold text-ink/60">{p.brandName}</div>
            <div className="text-[12px] mt-0.5 line-clamp-1 group-hover:text-accent">{p.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
