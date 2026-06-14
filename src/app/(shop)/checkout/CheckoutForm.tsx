"use client";
import { useActionState } from "react";
import { placeOrder, type CheckoutResult } from "./actions";
import { Field } from "@/components/ui/Field";

export function CheckoutForm({ defaultEmail, defaultName }: { defaultEmail: string; defaultName: string }) {
  const [state, action, pending] = useActionState<CheckoutResult | null, FormData>(
    async (_prev, formData) => {
      const res = await placeOrder(_prev, formData);
      if (res.ok) window.location.href = res.checkoutUrl;
      return res;
    },
    null,
  );

  return (
    <form action={action} className="mt-8 space-y-8">
      {/* Contact */}
      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Contact</div>
        <Field label="Email" name="email" type="email" required defaultValue={defaultEmail} autoComplete="email" />
        <label className="flex items-start gap-2 mt-3 text-sm text-ink/75">
          <input type="checkbox" defaultChecked className="mt-1" />
          <span>Email me with news and offers from Radnar Supply.</span>
        </label>
      </div>

      {/* Shipping */}
      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Shipping Address</div>
        <div className="space-y-3">
          <Field label="Full name" name="name" required defaultValue={defaultName} autoComplete="name" />
          <Field label="Address" name="line1" required autoComplete="address-line1" />
          <Field label="Apartment, suite, etc. (optional)" name="line2" autoComplete="address-line2" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" name="city" required autoComplete="address-level2" />
            <Field label="Postcode" name="postcode" required autoComplete="postal-code" />
          </div>
          <Field label="Phone (for delivery)" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>

      {/* Delivery method */}
      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-3">Delivery Method</div>
        <div className="border-2 border-ink p-4 bg-cream/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display font-bold uppercase tracking-tight">Standard Tracked</div>
              <div className="text-sm text-ink/65 mt-0.5">2–4 working days · Royal Mail or DPD</div>
            </div>
            <div className="font-display font-black text-lg">£4.95<span className="text-[11px] tracking-[0.18em] text-ink/55 font-sans ml-1">FREE OVER £75</span></div>
          </div>
        </div>
      </div>

      <button disabled={pending} className="btn btn-lg btn-block">
        {pending ? "Redirecting to secure payment…" : "Continue to Payment →"}
      </button>
      {state && !state.ok ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}

      <p className="text-[11px] text-ink/55 leading-relaxed">
        By placing your order you agree to our Terms of Sale and Privacy Policy. Payment is handled securely by Mollie — Radnar Supply never sees your card details.
      </p>
    </form>
  );
}
