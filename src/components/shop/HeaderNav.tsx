"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Item = { id: string; slug: string; name: string };
type Feat = { id: string; slug: string; name: string; imageUrl: string; brandName: string };

const TOP_NAV = [
  { slug: "clothing",    label: "Clothing" },
  { slug: "shoes",       label: "Shoes" },
  { slug: "accessories", label: "Accessories" },
  { slug: "fragrance",   label: "Fragrance" },
];

export function HeaderNav({
  categories, brands, featured, cartCount, signedIn,
}: {
  categories: Item[]; brands: Item[]; featured: Feat[];
  cartCount: number; signedIn: boolean;
}) {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const router = useRouter();

  // Body scroll lock when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDrawer(false); setSearch(false); }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") || "").trim();
    setSearch(false);
    setDrawer(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const close = () => setDrawer(false);

  return (
    <>
      {/* Top bar — burger, logo, search, account, bag */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => setDrawer(true)}
            className="p-2 -ml-2 inline-flex flex-col gap-[5px] hover:opacity-70"
            aria-label="Open menu"
          >
            <span className="block w-6 h-[2px] bg-ink" />
            <span className="block w-6 h-[2px] bg-ink" />
            <span className="block w-6 h-[2px] bg-ink" />
          </button>
          <Link href="/" className="shrink-0">
            <Image src="/radnar-mark.png" alt="Radnar Supply" width={1600} height={535} priority className="h-9 md:h-10 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-5 text-[11px] tracking-[0.18em] uppercase font-semibold">
          <button onClick={() => setSearch((s) => !s)} className="hover:text-accent inline-flex items-center gap-1.5 p-1" aria-label="Search">
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

      {/* Search drawer (full width, slides down) */}
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

      {/* Left-side drawer (vertical menu, all viewport sizes) */}
      {drawer ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={close} />
          <aside className="absolute left-0 top-0 bottom-0 w-[88vw] max-w-md bg-paper flex flex-col">
            <div className="flex justify-between items-center px-6 py-5 border-b border-ink/15">
              <Image src="/radnar-mark.png" alt="Radnar Supply" width={1600} height={535} className="h-8 w-auto" />
              <button onClick={close} className="text-[11px] tracking-[0.22em] uppercase font-bold inline-flex items-center gap-2 hover:text-accent">
                Close <CloseIcon />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-6">
              {/* Search */}
              <form onSubmit={submitSearch} className="mb-6 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input name="q" placeholder="Search…" className="w-full bg-cream border-2 border-ink/20 pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-ink" />
              </form>

              {/* Categories */}
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Shop</div>
              <nav className="space-y-1">
                <Link href="/shop" onClick={close}
                  className="flex items-center justify-between font-display font-black text-3xl uppercase tracking-tight py-2.5 hover:text-accent">
                  Shop All <Arrow />
                </Link>
                {TOP_NAV.map((c) => (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={close}
                    className="flex items-center justify-between font-display font-black text-3xl uppercase tracking-tight py-2.5 hover:text-accent">
                    {c.label} <Arrow />
                  </Link>
                ))}
              </nav>

              {/* Brands */}
              <div className="mt-8 flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Brands</div>
                <Link href="/brands" onClick={close} className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink hover:text-accent">View Roster →</Link>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {brands.map((b) => (
                  <Link key={b.id} href={`/shop?brand=${b.slug}`} onClick={close}
                    className="text-sm py-1 hover:text-accent">{b.name}</Link>
                ))}
              </div>

              {/* Featured */}
              {featured.length > 0 ? (
                <>
                  <div className="mt-8 text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Featured</div>
                  <div className="grid grid-cols-2 gap-3">
                    {featured.slice(0, 4).map((p) => (
                      <Link key={p.id} href={`/product/${p.slug}`} onClick={close} className="group block">
                        <div className="aspect-[4/5] bg-cream overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                        </div>
                        <div className="mt-2 text-[10px] tracking-[0.18em] uppercase font-bold text-ink/60">{p.brandName}</div>
                        <div className="text-[12px] mt-0.5 line-clamp-1 group-hover:text-accent">{p.name}</div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Account + about */}
              <div className="mt-10 pt-6 border-t border-ink/15 space-y-3 text-[12px] tracking-[0.18em] uppercase font-semibold">
                <Link href={signedIn ? "/account" : "/login"} onClick={close} className="block hover:text-accent">
                  {signedIn ? "Account" : "Sign In / Register"}
                </Link>
                <Link href="/about" onClick={close} className="block hover:text-accent">About</Link>
                <Link href="/policies/shipping" onClick={close} className="block hover:text-accent">Help &amp; Policies</Link>
                <a href="mailto:hello@radnar.supply" className="block hover:text-accent">Contact Us</a>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18 18 6" /></svg>;
}
function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="opacity-50"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
