import Link from "next/link";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "About — Below Retail. Always.",
  description: "Radnar Supply is a Birmingham-based designer reseller. Authenticated. Negotiated. Below retail. Always.",
};

export default async function About() {
  const [productCount, brandCount, categoryCount] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.brand.count(),
    db.category.count(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="border-b border-ink/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="rule-eyebrow">Manifesto</div>
          <h1 className="font-display font-black text-6xl md:text-[9rem] uppercase display-tight mt-6">
            Authenticated.<br/>
            Negotiated.<br/>
            <span className="text-accent">Below retail.</span><br/>
            Always.
          </h1>
          <p className="mt-10 max-w-2xl text-[18px] md:text-[22px] leading-snug text-ink/80 font-display font-medium">
            Radnar Supply is a Birmingham-based designer reseller built on one principle — the houses you actually wear, priced like they should be.
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-ink/15 bg-cream">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: productCount, l: "Products live" },
            { n: brandCount,   l: "Designer brands" },
            { n: categoryCount, l: "Categories" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display font-black text-5xl md:text-7xl tracking-tightest">{s.n}+</div>
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/65 mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="rule-eyebrow">The Story</div>
          <h2 className="mt-4 font-display font-black text-5xl md:text-6xl uppercase display-tight">
            Built in Birmingham. Loud on purpose.
          </h2>
        </div>
        <div className="md:col-span-7 space-y-5 text-[16px] leading-relaxed text-ink/85">
          <p>Designer doesn't have to mean department-store mark-up. We started Radnar because the gulf between RRP and what these pieces should actually cost had become absurd — and nobody was willing to call it.</p>
          <p>We're independent. We negotiate stock directly with verified sources across Europe. Every item lands in our Birmingham warehouse, gets authenticated by hand, and ships within 48 hours. The savings between RRP and retail go to you, not a markup.</p>
          <p>We're not a marketplace. We don't sell other people's listings. Every item on this site is in our possession, photographed by us, and graded by us.</p>
        </div>
      </section>

      {/* AUTHENTICATION PROCESS */}
      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="rule-eyebrow text-paper">How We Authenticate</div>
          <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
            Verified <span className="text-accent">in-house.</span><br/>
            Every piece.
          </h2>
          <div className="mt-14 grid md:grid-cols-4 gap-8">
            {[
              { n: "01", h: "Sourced",      p: "Stock comes from verified European partners with documented provenance — never from anonymous marketplaces or unbranded resellers." },
              { n: "02", h: "Received",     p: "Every unit is checked against the invoice on arrival. Anything unexpected is held until cleared." },
              { n: "03", h: "Authenticated", p: "Hand inspection: stitching, hardware, font kerning, serial numbers, factory codes. Cross-referenced with brand references." },
              { n: "04", h: "Graded",       p: "Photographed, condition-graded, listed. Anything that doesn't pass is returned to source. No exceptions." },
            ].map((s, i) => (
              <div key={s.n} className={`pt-8 ${i < 3 ? "md:border-r" : ""} md:pr-8 border-paper/15`}>
                <div className="font-display font-black text-5xl text-accent">{s.n}</div>
                <div className="font-display font-black text-2xl uppercase mt-3 tracking-tight">{s.h}</div>
                <div className="text-sm text-paper/75 mt-3 leading-relaxed">{s.p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMISE */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="rule-eyebrow">The Promise</div>
        <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
          Three rules.<br/>
          Non-negotiable.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-0 border border-ink">
          {[
            { h: "Every piece, verified",   p: "If we wouldn't wear it ourselves, it doesn't ship. If it isn't authentic, you get a full refund — no questions, no rebuttal." },
            { h: "Always below RRP",        p: "We don't price-match. We don't sale-cycle. The price you see is below retail every day." },
            { h: "Ship same day, hassle-free", p: "Orders placed before 2pm go out the same working day from Birmingham. 30-day returns, free for UK customers." },
          ].map((p, i) => (
            <div key={p.h} className={`p-8 md:p-10 ${i < 2 ? "md:border-r" : ""} border-ink`}>
              <div className="font-display font-black text-3xl uppercase tracking-tight display-tight">{p.h}</div>
              <p className="text-sm text-ink/75 mt-4 leading-relaxed">{p.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT / CO INFO */}
      <section className="border-t border-ink/15 bg-cream">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <div className="rule-eyebrow">Get In Touch</div>
            <h2 className="mt-4 font-display font-black text-4xl md:text-6xl uppercase display-tight">
              Questions? Tell us.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/75">
              Order issues, authentication questions, wholesale enquiries — we reply within one working day.
            </p>
            <a href="mailto:hello@radnar.supply" className="inline-block mt-6 bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
              hello@radnar.supply →
            </a>
          </div>
          <div className="md:col-span-5 text-sm">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Registered Office</div>
            <div className="font-medium">Radnar Supply Ltd</div>
            <div className="text-ink/75 mt-1">Birmingham, United Kingdom</div>
            <div className="text-ink/75 mt-3">Company No. <span className="font-mono">17263761</span></div>
            <Link href="/shop" className="inline-block mt-8 border-2 border-ink px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-colors">
              Start Shopping →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
