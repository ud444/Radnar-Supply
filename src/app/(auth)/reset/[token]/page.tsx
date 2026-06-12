"use client";
import { useActionState } from "react";
import { use } from "react";
import { resetAction, type FormState } from "../../actions";

export default function Reset({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, action, pending] = useActionState<FormState, FormData>(resetAction, null);
  return (
    <form action={action} className="w-full max-w-sm bg-white border border-line rounded p-8">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Set a new password</h1>
      <input type="hidden" name="token" value={token} />
      <label className="block mt-5">
        <span className="text-[11px] tracking-[0.16em] uppercase text-muted">New password</span>
        <input name="password" type="password" required minLength={8} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm focus:outline-none focus:border-ink" />
      </label>
      <button disabled={pending} className="mt-6 w-full bg-ink text-white py-3 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Updating…" : "Update password"}
      </button>
      {state?.error ? <div className="mt-3 text-sm text-red-600">{state.error}</div> : null}
    </form>
  );
}
