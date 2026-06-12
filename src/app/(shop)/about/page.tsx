import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="rule-eyebrow">Manifesto</div>
      <h1 className="font-display font-black text-6xl md:text-9xl uppercase display-tight mt-6">
        Out of Birmingham.<br/>
        <span className="text-accent">Always below retail.</span>
      </h1>

      <div className="grid md:grid-cols-12 gap-12 mt-16">
        <div className="md:col-span-7 space-y-6 leading-relaxed text-[16px] text-ink/85">
          <p>Radnar Supply exists for one reason — to put authenticated designer pieces in your hands without the markup.</p>
          <p>We negotiate stock directly with verified sources, authenticate every item in-house, and pass the saving on. No drop hype. No middlemen. Just product.</p>
          <p>Founded in Birmingham, UK in 2026. We ship daily — clothing, shoes, accessories, and the fragrances you actually wear.</p>
          <Link href="/shop" className="inline-block bg-ink text-paper px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
            Shop Now →
          </Link>
        </div>
        <div className="md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/radnar-about/700/875" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
