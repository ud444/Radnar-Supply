"use client";
import Link from "next/link";
import { useActionState } from "react";
import { forgotAction, type FormState } from "../actions";

export default function Forgot() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotAction, null);
  return (
    <form action={action} className="w-full max-w-sm bg-white border border-line rounded p-8">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Reset password</h1>
      <p className="text-sm text-muted mt-1">Enter your email and we'll send a reset link.</p>
      <label className="block mt-5">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Email</span>
        <input name="email" type="email" required className="mt-1 w-full border border-line rounded px-3 py-3 text-sm focus:outline-none focus:border-ink" />
      </label>
      <button disabled={pending} className="mt-6 w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Sending…" : "Send reset link"}
      </button>
      {state !== null && !state.error ? <div className="mt-3 text-sm text-green-700">If an account exists for that email, a link has been sent.</div> : null}
      <div className="mt-6 text-sm text-center">
        <Link href="/login" className="underline">Back to sign in</Link>
      </div>
    </form>
  );
}
