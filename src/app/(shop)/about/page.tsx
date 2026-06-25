import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { getHomeMedia } from "@/lib/content";
import { Reveal } from "@/components/shop/Reveal";

export const metadata = {
  title: "Our Story — Source. Supply. Personal Shop.",
  description:
    "Radnar Supply is a UK sourcing and supply business with a retail arm — premium fashion, luxury goods, personal shopping and discreet private sourcing through our supplier network.",
};

export default async function About() {
  const [productCount, brandCount, categoryCount, media] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.brand.count(),
    db.category.count(),
    getHomeMedia(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="border-b border-ink/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="rule-eyebrow">Our Story</div>
          <h1 className="font-display font-black text-6xl md:text-[9rem] uppercase display-tight mt-6">
            Source.<br/>
            Supply.<br/>
            <span className="text-accent">Personal shop.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-[18px] md:text-[22px] leading-snug text-ink/80 font-display font-medium">
            Radnar Supply is a UK sourcing and supply business — with a retail arm. We hold stock you can buy today, and source the things you can&apos;t find anywhere else.
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-ink/15 bg-cream">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: productCount, l: "Products in stock" },
            { n: brandCount,   l: "Brands sourced" },
            { n: categoryCount, l: "Categories" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display font-black text-5xl md:text-7xl tracking-tightest">{s.n}+</div>
              <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/65 mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOURCE & SUPPLY */}
      <Reveal as="section" className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="rule-eyebrow">Source &amp; Supply</div>
          <h2 className="mt-4 font-display font-black text-5xl md:text-6xl uppercase display-tight">
            A sourcing company first.
          </h2>
        </div>
        <div className="md:col-span-7 space-y-5 text-[16px] leading-relaxed text-ink/85">
          <p>Most stores sell what they happen to have. We start from the other end — what you actually want — and go and find it. Radnar is built on a network of trusted suppliers and industry contacts across Europe, giving us reach into premium fashion, footwear, accessories, fragrance and luxury goods.</p>
          <p>That sourcing engine feeds two things: the stock you can buy instantly on this site, and a made-to-order supply service for everything else. We negotiate directly, verify what we handle, and ship from the UK.</p>
          <p>It means Radnar can be your shop and your sourcing partner at once — retail when it&apos;s in stock, supply when it isn&apos;t.</p>
        </div>
      </Reveal>

      {/* PERSONAL SHOPPING SERVICE */}
      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="group md:col-span-5 relative aspect-[4/5] overflow-hidden bg-cream/10 rounded-[20px] shadow-card">
            <Image src={media.personal} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]" />
          </div>
          <Reveal className="md:col-span-7">
            <div className="rule-eyebrow text-paper">Personal Shopping Service</div>
            <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
              We find it <span className="text-accent">for you.</span>
            </h2>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-paper/75">
              Tell us what you&apos;re after — a specific size, a sold-out drop, a hard-to-find piece, or a high-value luxury item through RADNAR Private. Our team works the network and comes back with real options and pricing. No obligation, and no payment until you approve.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/sourcing" className="bg-paper text-ink px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent hover:text-paper transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">
                Start My Search →
              </Link>
              <Link href="/sourcing?type=private" className="border-2 border-paper text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-paper hover:text-ink transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">
                Radnar Private
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW WE WORK */}
      <Reveal as="section" className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="rule-eyebrow">How We Work</div>
        <h2 className="mt-4 font-display font-black text-5xl md:text-7xl uppercase display-tight">
          Sourced. Verified.<br/>Supplied.
        </h2>
        <div className="mt-14 grid md:grid-cols-4 gap-8">
          {[
            { n: "01", h: "Sourced",   p: "Through verified suppliers and industry contacts — for stock, and for one-off personal requests." },
            { n: "02", h: "Verified",  p: "Everything we handle is checked before it ships. Documented provenance, hand inspection, no exceptions." },
            { n: "03", h: "Supplied",  p: "Buy in-stock instantly, or approve a sourced option. We dispatch fast from the UK, fully tracked." },
            { n: "04", h: "Supported", p: "A real UK business behind it — Company No. 17263761 — contactable for every order and enquiry." },
          ].map((s, i) => (
            <div key={s.n} className={`pt-8 ${i < 3 ? "md:border-r" : ""} md:pr-8 border-ink/15`}>
              <div className="font-display font-black text-5xl text-accent">{s.n}</div>
              <div className="font-display font-black text-2xl uppercase mt-3 tracking-tight">{s.h}</div>
              <div className="text-sm text-ink/75 mt-3 leading-relaxed">{s.p}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CONTACT / CO INFO */}
      <section className="border-t border-ink/15 bg-cream">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <div className="rule-eyebrow">Get In Touch</div>
            <h2 className="mt-4 font-display font-black text-4xl md:text-6xl uppercase display-tight">
              Questions? Tell us.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/75">
              Order issues, sourcing enquiries, personal shopping, wholesale — we reply within one working day.
            </p>
            <a href="mailto:hello@radnarsupply.com" className="inline-block mt-6 bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">
              hello@radnarsupply.com →
            </a>
          </div>
          <div className="md:col-span-5 text-sm">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Registered Office</div>
            <div className="font-medium">Radnar Supply Ltd</div>
            <div className="text-ink/75 mt-1">United Kingdom</div>
            <div className="text-ink/75 mt-3">Company No. <span className="font-mono">17263761</span></div>
            <Link href="/sourcing" className="inline-block mt-8 border border-ink px-6 py-3.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-[10px]">
              Request Sourcing →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
