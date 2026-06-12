import Link from "next/link";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/session";

const NAV = [
  { href: "/shop?category=clothing",    label: "Clothing" },
  { href: "/shop?category=shoes",       label: "Shoes" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/shop?category=fragrance",   label: "Fragrance" },
];

export async function Header() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="bg-ink text-white text-[10.5px] tracking-[0.2em] uppercase text-center py-2">
        Free UK Delivery Over £75 · 30-Day Returns · Verified Designer
      </div>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-[1.05rem] font-semibold tracking-tightest">
            Radnar<span className="text-muted">/Supply</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink/85">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink">{l.label}</Link>
            ))}
            <Link href="/shop" className="hover:text-ink">All</Link>
          </nav>
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          <Link href="/shop" className="hidden md:inline text-ink/80 hover:text-ink">Search</Link>
          <Link href={session ? "/account" : "/login"} className="hidden sm:inline text-ink/80 hover:text-ink">
            {session ? "Account" : "Sign in"}
          </Link>
          <Link href="/cart" className="font-medium relative">
            Bag
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-[20px] text-[11px] bg-ink text-white rounded-full px-1.5">{cart.count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
