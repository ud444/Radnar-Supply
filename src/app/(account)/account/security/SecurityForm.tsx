"use client";
import { useActionState } from "react";
import { changePasswordAction, type FormState } from "./actions";
import { Field } from "@/components/ui/Field";

export function SecurityForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, null);
  return (
    <form action={action} className="space-y-4">
      <Field label="Current password" name="current" type="password" required autoComplete="current-password" />
      <Field label="New password" name="next" type="password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." />
      <Field label="Confirm new password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      <button disabled={pending} className="btn btn-lg btn-block">
        {pending ? "Updating…" : "Update Password →"}
      </button>
      {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
      {state?.ok ? (
        <div className="p-3 bg-accent/10 border-2 border-accent text-[11px] tracking-[0.18em] uppercase font-bold text-ink">
          Password updated. Other devices signed out.
        </div>
      ) : null}
    </form>
  );
}
