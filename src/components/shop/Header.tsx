import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/session";
import { HeaderNav } from "./HeaderNav";

const MARQUEE = [
  "Free UK Delivery Over £75",
  "30-Day Returns",
  "Verified Designer",
  "Below Retail. Always.",
  "Klarna · PayPal · Apple Pay",
  "Drops Every Friday",
];

export async function Header() {
  const [cart, session, categories, brands, featured] = await Promise.all([
    getCart(),
    getSession(),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { active: true, featured: true }, take: 4,
      include: { brand: true, images: { take: 1, orderBy: { position: "asc" } } },
    }),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-ink/15">
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

      <HeaderNav
        categories={categories.map(({ id, slug, name }) => ({ id, slug, name }))}
        brands={brands.map(({ id, slug, name }) => ({ id, slug, name }))}
        featured={featured.map((p) => ({
          id: p.id, slug: p.slug, name: p.name,
          imageUrl: p.images[0]?.url ?? "",
          brandName: p.brand.name,
        }))}
        cartCount={cart.count}
        signedIn={!!session}
      />
    </header>
  );
}
