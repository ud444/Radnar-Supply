"use client";
import { useActionState } from "react";
import { setupAdmin, type FormState } from "./actions";
import { Field } from "@/components/ui/Field";

export function SetupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setupAdmin, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <Field label="Name" name="name" required autoComplete="name" />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." />
      <button disabled={pending} className="btn btn-lg btn-block">
        {pending ? "Creating admin…" : "Create admin & continue →"}
      </button>
      {state?.error ? <div className="field-error tracking-[0.06em] uppercase font-bold">{state.error}</div> : null}
    </form>
  );
}
