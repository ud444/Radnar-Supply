"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { UploadButton } from "@/lib/uploadthing";
import { submitSourcingRequest, type SourcingResult } from "./actions";

export function SourcingForm({ type }: { type: "STANDARD" | "PRIVATE" }) {
  const [images, setImages] = useState<string[]>([]);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [state, action, pending] = useActionState<SourcingResult | null, FormData>(
    async (_prev, fd) => submitSourcingRequest(_prev, fd),
    null,
  );

  if (state?.ok) {
    return (
      <div className="card-frame mt-8 text-center py-14">
        <div className="font-display font-black text-4xl md:text-5xl uppercase display-tight">Request received.</div>
        <p className="mt-4 max-w-md mx-auto text-ink/70 text-[15px] leading-relaxed">
          Our team is on it. We&apos;ll email you shortly with options and pricing from our supplier network.
        </p>
        <Link href="/shop" className="btn mt-8">Browse stock while you wait →</Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-8">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="imageUrls" value={JSON.stringify(images)} />
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Your details</div>
        <div className="space-y-3">
          <Field label="Full name" name="name" required autoComplete="name" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
          </div>
        </div>
      </div>

      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">What are you after?</div>
        <div className="space-y-3">
          <Field label="Describe the item" name="item" required hint="Brand, model, colour, reference — as much as you know." />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Size (optional)" name="size" />
            <Field label="Budget / target price (optional)" name="budget" />
          </div>
          <label className="field block">
            <span className="field-label" style={{ position: "static", display: "block", marginBottom: 6 }}>Anything else? (optional)</span>
            <textarea name="detail" rows={4} className="field-input" placeholder="Deadlines, condition, alternatives you'd accept…" />
          </label>
        </div>
      </div>

      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Reference image (optional)</div>
        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {images.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt="" className="aspect-square object-cover bg-cream border border-ink/15" />
            ))}
          </div>
        ) : null}
        <UploadButton
          endpoint="sourcingImage"
          onClientUploadComplete={(files) =>
            setImages((prev) => [...prev, ...files.map((f) => (f as any).ufsUrl ?? (f as any).url)].slice(0, 4))
          }
          onUploadError={(e) => setUploadErr((e as any).message)}
          appearance={{ button: "btn btn-ghost", allowedContent: "text-[11px] text-ink/50 mt-1" }}
        />
        {uploadErr ? <div className="field-error mt-2">{uploadErr}</div> : null}
      </div>

      <button disabled={pending} className="btn btn-lg btn-block">
        {pending ? "Sending…" : type === "PRIVATE" ? "Submit Private Enquiry →" : "Start My Search →"}
      </button>
      {state && !state.ok ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}

      <p className="text-[11px] text-ink/55 leading-relaxed">
        We&apos;ll only use your details to respond to this enquiry. No obligation, no payment until you approve an option.
      </p>
    </form>
  );
}
