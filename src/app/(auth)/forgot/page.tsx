"use client";
import Link from "next/link";
import { useActionState } from "react";
import { forgotAction, type FormState } from "../actions";
import { Field } from "@/components/ui/Field";

export default function Forgot() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotAction, null);
  return (
    <div>
      <div className="eyebrow-lead">Reset Password</div>
      <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Forgot it?</h1>
      <p className="mt-3 text-sm text-ink/65">Enter your email — we'll send a reset link. The link expires in one hour.</p>

      <form action={action} className="mt-8 space-y-4">
        <Field label="Email" name="email" type="email" required autoComplete="email" autoFocus />
        <button disabled={pending} className="btn btn-lg btn-block">
          {pending ? "Sending…" : "Send reset link →"}
        </button>
        {state !== null && !state.error ? (
          <div className="p-3 bg-accent/10 border-2 border-accent text-[11px] tracking-[0.18em] uppercase font-bold text-ink">
            If an account exists for that email, a link has been sent.
          </div>
        ) : null}
      </form>

      <div className="mt-10 pt-6 border-t border-ink/15 text-sm">
        <Link href="/login" className="text-[11px] tracking-[0.18em] uppercase font-bold hover:text-accent">← Back to sign in</Link>
      </div>
    </div>
  );
}
