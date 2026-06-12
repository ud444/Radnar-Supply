import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-20">
      <div className="text-[11px] tracking-[0.22em] uppercase text-muted">About</div>
      <h1 className="mt-2 text-3xl md:text-5xl font-display font-semibold tracking-tightest">
        Out of Birmingham. <em className="not-italic text-muted">Always below retail.</em>
      </h1>
      <div className="grid md:grid-cols-12 gap-12 mt-12">
        <div className="md:col-span-7 space-y-5 leading-relaxed">
          <p>Radnar Supply exists for one reason — to put authenticated designer pieces in your hands without the markup.</p>
          <p>We negotiate stock directly with verified sources, authenticate every item in-house, and pass the saving on. No drop hype. No middlemen. Just product.</p>
          <p>Founded in Birmingham, UK in 2026. We ship daily — clothing, shoes, accessories, and the fragrances you actually wear.</p>
          <Link href="/shop" className="inline-block bg-ink text-white px-6 py-3 mt-4 rounded-full text-sm font-medium">Shop now</Link>
        </div>
        <div className="md:col-span-5">
          <div className="aspect-[4/5] rounded overflow-hidden bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/radnar-about/700/875" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
