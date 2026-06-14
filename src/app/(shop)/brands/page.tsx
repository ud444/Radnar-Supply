import Link from "next/link";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Brands — Verified Designer, Below Retail",
  description: "Every brand we carry is hand-picked, authenticated in-house, and priced below RRP. Browse the Radnar Supply roster.",
};

export default async function Brands() {
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { products: { where: { active: true }, take: 4, include: { images: { take: 1, orderBy: { position: "asc" } } } } },
  });

  // Group brands by initial letter
  const groups = brands.reduce<Record<string, typeof brands>>((acc, b) => {
    const k = b.name[0].toUpperCase();
    (acc[k] = acc[k] ?? []).push(b);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();

  return (
    <>
      {/* HERO */}
      <section className="border-b border-ink/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-12 md:pb-16">
          <div className="rule-eyebrow">The Roster</div>
          <h1 className="mt-6 font-display font-black text-6xl md:text-[10rem] uppercase display-tight">
            Houses we<br/>
            <span className="text-accent">vouch for.</span>
          </h1>
          <p className="mt-10 max-w-xl text-[16px] leading-relaxed text-ink/80">
            Every brand on Radnar Supply is hand-picked, authenticated in-house, and priced below RRP. No marketplace listings, no third-party sellers — only stock we hold ourselves.
          </p>
        </div>
      </section>

      {/* A–Z jump */}
      <nav className="border-b border-ink/15 sticky top-20 z-30 bg-paper/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 shrink-0">A–Z</span>
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="text-[11px] tracking-[0.18em] uppercase font-bold border-2 border-ink/15 px-2.5 py-1 hover:border-ink shrink-0">{l}</a>
          ))}
          <span className="ml-auto text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 shrink-0">{brands.length} brands</span>
        </div>
      </nav>

      {/* Brand grid by letter */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16 space-y-16">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-36">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display font-black text-7xl md:text-9xl tracking-tightest leading-none text-accent">{letter}</h2>
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">
                {groups[letter].length} brand{groups[letter].length !== 1 ? "s" : ""}
              </div>
            </div>
            <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
              {groups[letter].map((b) => (
                <li key={b.id}>
                  <Link href={`/shop?brand=${b.slug}`} className="block group">
                    <div className="py-6 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <div className="num-mark">·</div>
                        <div className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight leading-none group-hover:text-accent transition-colors">{b.name}</div>
                        <div className="text-[12px] text-ink/65 mt-2">{b.products.length} product{b.products.length !== 1 ? "s" : ""} live</div>
                      </div>
                      {/* Preview thumbnails */}
                      <div className="col-span-9 md:col-span-6 grid grid-cols-4 gap-2">
                        {b.products.slice(0, 4).map((p) => (
                          <div key={p.id} className="aspect-[4/5] bg-cream overflow-hidden">
                            {p.images[0] ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - b.products.length) }).map((_, i) => (
                          <div key={`x${i}`} className="aspect-[4/5] bg-cream border border-ink/10" />
                        ))}
                      </div>
                      <div className="col-span-3 md:col-span-1 text-right">
                        <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/60 group-hover:text-accent">Shop →</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
