"use client";
import { use } from "react";
import { useActionState } from "react";
import { resetAction, type FormState } from "../../actions";
import { Field } from "@/components/ui/Field";

export default function Reset({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, action, pending] = useActionState<FormState, FormData>(resetAction, null);
  return (
    <div>
      <div className="eyebrow-lead">New Password</div>
      <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Pick a new one.</h1>
      <p className="mt-3 text-sm text-ink/65">At least 8 characters. Pick something only you'll remember.</p>

      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        <Field label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus />
        <button disabled={pending} className="btn btn-lg btn-block">
          {pending ? "Updating…" : "Update password →"}
        </button>
        {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
      </form>
    </div>
  );
}
