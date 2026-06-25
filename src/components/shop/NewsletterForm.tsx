"use client";
import { useState, useTransition } from "react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const company = String(fd.get("company") || "");
    if (!email) return;
    start(async () => {
      const res = await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email, company }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setState("ok"); setMsg("You're in. Check your inbox for your discount."); (e.target as HTMLFormElement).reset(); }
      else { setState("err"); setMsg(data.error || "Couldn't sign you up — try again."); }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      {/* Honeypot — hidden from humans, bots fill it */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex">
        <input
          name="email" type="email" required placeholder="Your email"
          className="flex-1 bg-paper text-ink px-4 py-3 text-sm placeholder:text-ink/50 focus:outline-none"
        />
        <button disabled={pending}
          className="bg-accent text-paper px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-paper hover:text-ink disabled:opacity-50 transition-colors">
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {msg ? (
        <div className={`mt-2 text-[11px] tracking-[0.18em] uppercase font-bold ${state === "ok" ? "text-accent" : "text-red-300"}`}>
          {msg}
        </div>
      ) : null}
    </form>
  );
}
