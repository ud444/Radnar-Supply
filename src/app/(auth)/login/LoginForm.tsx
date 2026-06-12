"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInAction, type FormState } from "../actions";

export function LoginForm() {
  const sp = useSearchParams();
  const [state, action, pending] = useActionState<FormState, FormData>(signInAction, null);
  return (
    <form action={action} className="w-full max-w-sm bg-white border border-line rounded p-8">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Sign in</h1>
      <p className="text-sm text-muted mt-1">Welcome back.</p>
      {sp.get("reset") ? <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mt-3">Password updated. Sign in to continue.</p> : null}
      <input type="hidden" name="next" value={sp.get("next") ?? "/account"} />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <button disabled={pending} className="mt-6 w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state?.error ? <div className="mt-3 text-sm text-red-600">{state.error}</div> : null}
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/forgot" className="underline text-muted">Forgot password?</Link>
        <Link href="/register" className="underline">Create account</Link>
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
