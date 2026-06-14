"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type FormState } from "../actions";
import { Field } from "@/components/ui/Field";

export default function Register() {
  const [state, action, pending] = useActionState<FormState, FormData>(signUpAction, null);
  return (
    <div>
      <div className="eyebrow-lead">Create Account</div>
      <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Get the drop.</h1>
      <p className="mt-3 text-sm text-ink/65">Existing customer? <Link href="/login" className="underline font-medium hover:text-accent">Sign in</Link>.</p>

      <form action={action} className="mt-8 space-y-4">
        <Field label="Name (optional)" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." />
        <button disabled={pending} className="btn btn-lg btn-block">
          {pending ? "Creating account…" : "Create account →"}
        </button>
        {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
        <p className="text-[11px] text-ink/55 leading-relaxed">
          By creating an account you agree to our <Link href="/policies/terms" className="underline">Terms</Link> and <Link href="/policies/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}
