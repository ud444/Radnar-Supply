"use client";
import { useState, useTransition } from "react";
import { submitReview } from "./actions";

export function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("rating", String(rating));
    setErr(null);
    start(async () => {
      const res = await submitReview(productId, slug, fd);
      if (res.ok) setDone(true);
      else setErr(res.error ?? "Something went wrong");
    });
  }

  if (done) {
    return (
      <div className="card-frame mt-6">
        <p className="text-sm font-bold text-accent tracking-[0.04em]">✓ Thanks — your review is in. It'll appear once we've checked it over.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-frame mt-6 space-y-4">
      <div className="eyebrow-lead">Write a review</div>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}
            className={`text-3xl leading-none transition-colors ${(hover || rating) >= n ? "text-accent" : "text-ink/20"}`}
          >★</button>
        ))}
      </div>

      <input name="author" required maxLength={60} placeholder="Your name"
        className="w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
      <textarea name="body" required rows={3} maxLength={1000} placeholder="How did it fit? Would you buy again?"
        className="w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />

      <button disabled={pending} className="btn btn-block">{pending ? "Sending…" : "Submit review"}</button>
      {err ? <div className="field-error">{err}</div> : null}
    </form>
  );
}

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex ${className}`} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? "text-accent" : "text-ink/20"}>★</span>
      ))}
    </span>
  );
}
