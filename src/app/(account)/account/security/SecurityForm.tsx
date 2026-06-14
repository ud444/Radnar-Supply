"use client";
import { useActionState } from "react";
import { changePasswordAction, type FormState } from "./actions";

export function SecurityForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, null);
  return (
    <form action={action} className="mt-8 max-w-md space-y-4">
      <Field label="Current password" name="current" type="password" required />
      <Field label="New password" name="next" type="password" required minLength={8} />
      <Field label="Confirm new password" name="confirm" type="password" required minLength={8} />
      <button disabled={pending}
        className="w-full bg-ink text-paper py-3 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent disabled:opacity-50 transition-colors">
        {pending ? "Updating…" : "Update Password"}
      </button>
      {state?.error ? <div className="text-sm text-red-600">{state.error}</div> : null}
      {state?.ok ? <div className="text-sm text-green-700">Password updated. Existing sessions on other devices were signed out.</div> : null}
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55">{label}</span>
      <input {...rest} className="mt-1 w-full border-2 border-ink/20 bg-bone px-3 py-3 text-sm focus:outline-none focus:border-ink" />
    </label>
  );
}
