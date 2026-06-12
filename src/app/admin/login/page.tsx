"use client";
import { useActionState } from "react";
import { adminLoginAction, type FormState } from "./actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminLoginAction, null);
  return (
    <div className="min-h-screen grid place-items-center bg-soft px-5">
      <form action={action} className="w-full max-w-sm bg-white border border-line rounded p-8">
        <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Radnar · Admin</div>
        <h1 className="mt-2 text-xl font-display font-semibold tracking-tightest">Sign in</h1>
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <button disabled={pending} className="mt-6 w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
          {pending ? "Signing in…" : "Sign in"}
        </button>
        {state?.error ? <div className="mt-3 text-sm text-red-600">{state.error}</div> : null}
      </form>
    </div>
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
