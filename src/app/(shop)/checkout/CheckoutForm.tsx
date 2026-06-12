"use client";
import { useActionState } from "react";
import { placeOrder, type CheckoutResult } from "./actions";

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
    <form action={action} className="mt-8 space-y-4">
      <Field label="Email" name="email" type="email" required defaultValue={defaultEmail} />
      <Field label="Full name" name="name" required defaultValue={defaultName} />
      <Field label="Address" name="line1" required />
      <Field label="Address line 2 (optional)" name="line2" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" name="city" required />
        <Field label="Postcode" name="postcode" required />
      </div>
      <Field label="Phone (optional)" name="phone" type="tel" />
      <button disabled={pending} className="w-full bg-ink text-white py-4 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Redirecting to payment…" : "Continue to payment"}
      </button>
      {state && !state.ok ? <div className="text-sm text-red-600">{state.error}</div> : null}
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.16em] uppercase text-muted">{label}</span>
      <input {...rest} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm focus:outline-none focus:border-ink" />
    </label>
  );
}
