"use client";
import { useActionState } from "react";
import { setupAdmin, type FormState } from "./actions";

export function SetupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setupAdmin, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <Field label="Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required minLength={8} />
      <button disabled={pending} className="w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Creating admin…" : "Create admin & continue"}
      </button>
      {state?.error ? <div className="text-sm text-red-600">{state.error}</div> : null}
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
