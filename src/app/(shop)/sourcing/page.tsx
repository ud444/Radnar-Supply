import type { Metadata } from "next";
import { SourcingForm } from "./SourcingForm";

export const metadata: Metadata = {
  title: "Request Sourcing — Radnar Supply",
  description:
    "Looking for something specific? Radnar Supply sources premium fashion, footwear and luxury goods through our trusted network of suppliers and industry contacts.",
};

export default async function SourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: rawType } = await searchParams;
  const isPrivate = rawType === "private";
  const type = isPrivate ? "PRIVATE" : "STANDARD";

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left — pitch */}
        <div className="md:col-span-5 min-w-0">
          <div className="rule-eyebrow">{isPrivate ? "Radnar Private" : "Personal Shopping"}</div>
          <h1 className="mt-6 font-display font-black text-[13vw] sm:text-5xl md:text-7xl uppercase display-tight break-words">
            {isPrivate ? (
              <>Sourced<br />discreetly.</>
            ) : (
              <>Start your<br /><span className="text-accent">search.</span></>
            )}
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink/75">
            {isPrivate
              ? "High-value designer and luxury goods, sourced privately through our network. Tell us what you're hunting for — we handle the rest, discreetly. Enquiry only."
              : "Tell us what you're looking for. Our team works our network of trusted suppliers and industry contacts to find it — at the right price. No obligation."}
          </p>

          <div className="mt-10 space-y-5 border-t border-ink/15 pt-8">
            {[
              { n: "01", h: "Tell us what you want", p: "Describe the item, size and budget. Add a photo if you have one." },
              { n: "02", h: "We source it", p: "We tap our supplier network and industry contacts to track it down." },
              { n: "03", h: "You approve", p: "We send options and pricing. No payment until you say go." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="font-display font-black text-2xl text-accent shrink-0">{s.n}</div>
                <div>
                  <div className="font-display font-bold uppercase tracking-tight">{s.h}</div>
                  <div className="text-sm text-ink/65 mt-0.5 leading-relaxed">{s.p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="md:col-span-7 min-w-0">
          <div className="card-frame max-w-full overflow-hidden">
            <SourcingForm type={type} />
          </div>
        </div>
      </div>
    </div>
  );
}
