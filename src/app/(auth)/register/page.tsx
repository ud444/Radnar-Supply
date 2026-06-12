"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type FormState } from "../actions";

export default function Register() {
  const [state, action, pending] = useActionState<FormState, FormData>(signUpAction, null);
  return (
    <form action={action} className="w-full max-w-sm bg-white border border-line rounded p-8">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Create account</h1>
      <p className="text-sm text-muted mt-1">Track orders, save addresses, faster checkout.</p>
      <Field label="Name (optional)" name="name" />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required minLength={8} />
      <button disabled={pending} className="mt-6 w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Creating…" : "Create account"}
      </button>
      {state?.error ? <div className="mt-3 text-sm text-red-600">{state.error}</div> : null}
      <div className="mt-6 text-sm text-center">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </div>
    </form>
  );
}
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block mt-4">
      <span className="text-[11px] tracking-[0.16em] uppercase text-muted">{label}</span>
      <input {...rest} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm focus:outline-none focus:border-ink" />
    </label>
  );
}
