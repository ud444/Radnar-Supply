"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInAction, type FormState } from "../actions";
import { Field } from "@/components/ui/Field";

export function LoginForm() {
  const sp = useSearchParams();
  const [state, action, pending] = useActionState<FormState, FormData>(signInAction, null);
  return (
    <div>
      <div className="eyebrow-lead">Sign In</div>
      <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Welcome back.</h1>
      <p className="mt-3 text-sm text-ink/65">New here? <Link href="/register" className="underline font-medium hover:text-accent">Create an account</Link> for faster checkout and order history.</p>

      {sp.get("reset") ? (
        <div className="mt-6 p-3 bg-accent/10 border-2 border-accent text-[11px] tracking-[0.18em] uppercase font-bold text-ink">
          Password updated. Sign in to continue.
        </div>
      ) : null}

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={sp.get("next") ?? "/account"} />
        <Field label="Email" name="email" type="email" required autoComplete="email" autoFocus />
        <Field label="Password" name="password" type="password" required autoComplete="current-password" />
        <div className="flex justify-end">
          <Link href="/forgot" className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink/55 hover:text-accent">Forgot password?</Link>
        </div>
        <button disabled={pending} className="btn btn-lg btn-block">
          {pending ? "Signing in…" : "Sign in →"}
        </button>
        {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
      </form>

      <div className="mt-10 pt-6 border-t border-ink/15 text-[11px] tracking-[0.16em] uppercase font-bold text-ink/55 flex flex-wrap gap-4 justify-between">
        <Link href="/policies/privacy" className="hover:text-accent">Privacy</Link>
        <Link href="/policies/terms" className="hover:text-accent">Terms</Link>
        <a href="mailto:hello@radnar.supply" className="hover:text-accent">Help</a>
      </div>
    </div>
  );
}
