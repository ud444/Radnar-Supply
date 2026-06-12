import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/session";

const NAV = [
  { href: "/shop?category=clothing",    label: "Clothing" },
  { href: "/shop?category=shoes",       label: "Shoes" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/shop?category=fragrance",   label: "Fragrance" },
  { href: "/shop",                      label: "Shop All" },
];

const MARQUEE = [
  "Free UK Delivery Over £75",
  "30-Day Returns",
  "Verified Designer",
  "Below Retail. Always.",
  "Klarna · PayPal · Apple Pay",
  "Drops Every Friday",
];

export async function Header() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-ink/15">
      {/* Marquee */}
      <div className="bg-ink text-paper overflow-hidden border-b border-ink">
        <div className="marquee-track py-2 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="text-[10.5px] tracking-[0.22em] uppercase font-medium px-7 inline-flex items-center gap-7">
              {m}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0 -mt-0.5">
          <Image
            src="/radnar-mark.png"
            alt="Radnar Supply"
            width={1600}
            height={535}
            priority
            className="h-9 md:h-10 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase font-semibold">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-[11px] tracking-[0.18em] uppercase font-semibold">
          <Link href="/shop" className="hidden md:inline hover:text-accent">Search</Link>
          <Link href={session ? "/account" : "/login"} className="hidden sm:inline hover:text-accent">
            {session ? "Account" : "Sign In"}
          </Link>
          <Link href="/cart" className="bg-ink text-paper px-3 py-2 inline-flex items-center gap-2 hover:bg-accent transition-colors">
            <span>Bag</span>
            <span className="bg-paper text-ink min-w-[20px] h-[20px] inline-flex items-center justify-center text-[10px] font-bold">
              {cart.count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
