"use client";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adminLoginAction, type FormState } from "./actions";
import { Field } from "@/components/ui/Field";

export default function AdminLogin() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminLoginAction, null);
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink text-paper">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-paper/15">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image src="/radnar-mark-light.png" alt="Radnar Supply" width={1600} height={593} className="h-9 w-auto" />
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55 border-l border-paper/30 pl-3">Admin</span>
        </Link>

        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55">Operations</div>
          <h1 className="mt-3 font-display font-black text-6xl uppercase display-tight">
            The control<br/>room.
          </h1>
          <p className="mt-5 max-w-sm text-paper/70 text-sm leading-relaxed">
            Orders, inventory, customers, settings — everything that runs the storefront, in one place.
          </p>
        </div>

        <ul className="space-y-2.5 text-[12px]">
          {[
            "Real-time order management",
            "Per-variant stock control",
            "UploadThing product imagery",
            "Branded transactional emails",
          ].map((b) => (
            <li key={b} className="flex items-center gap-3 text-paper/85 tracking-[0.04em]">
              <span className="w-1.5 h-1.5 bg-accent" />
              {b}
            </li>
          ))}
        </ul>

        <div aria-hidden className="absolute -right-12 -bottom-16 text-paper/[0.04] font-display font-black text-[20rem] leading-none pointer-events-none select-none">RS</div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-paper text-ink p-8 md:p-10">
          <div className="lg:hidden mb-6 inline-flex items-center gap-2">
            <Image src="/radnar-mark.png" alt="Radnar Supply" width={1600} height={535} className="h-7 w-auto" />
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Admin</span>
          </div>
          <div className="eyebrow-lead">Sign In · Admin</div>
          <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Welcome back.</h1>
          <p className="mt-3 text-sm text-ink/65">Authorised staff only. Customers — <Link href="/login" className="underline hover:text-accent">use the regular sign in</Link>.</p>

          <form action={action} className="mt-8 space-y-4">
            <Field label="Email" name="email" type="email" required autoComplete="email" autoFocus />
            <Field label="Password" name="password" type="password" required autoComplete="current-password" />
            <button disabled={pending} className="btn btn-lg btn-block">
              {pending ? "Signing in…" : "Sign in →"}
            </button>
            {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
          </form>

          <div className="mt-10 pt-6 border-t border-ink/15 text-[11px] tracking-[0.16em] uppercase font-bold text-ink/55 flex flex-wrap gap-4 justify-between">
            <Link href="/" className="hover:text-accent">← Storefront</Link>
            <a href="mailto:hello@radnarsupply.com" className="hover:text-accent">Need help?</a>
          </div>
        </div>
      </main>
    </div>
  );
}
