"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { subscribeBackInStock } from "./actions";

type Variant = { id: string; size: string; stock: number };

export function AddToCartForm({ variants, allOOS, productName, price, productId }: { variants: Variant[]; allOOS: boolean; productName: string; price: string; productId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [notify, setNotify] = useState<{ pending: boolean; done: boolean; err: string | null }>({ pending: false, done: false, err: null });
  const router = useRouter();

  const submitNotify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "");
    setNotify({ pending: true, done: false, err: null });
    start(async () => {
      const res = await subscribeBackInStock(productId, email);
      setNotify({ pending: false, done: res.ok, err: res.ok ? null : (res.error ?? "Something went wrong") });
    });
  };

  const add = () => {
    if (!selected) { setMsg({ kind: "err", text: "Pick a size first" }); return; }
    start(async () => {
      try {
        await addToCartAction(selected, 1);
        setAdded(true);
        setMsg(null);
        router.refresh();
      } catch (e: any) {
        setMsg({ kind: "err", text: e.message ?? "Couldn't add to bag" });
      }
    });
  };

  // Stock urgency for the selected size
  const selectedVariant = variants.find((v) => v.id === selected);
  const lowStock = selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3;

  if (allOOS) {
    return (
      <div className="mt-8 card-frame">
        <div className="eyebrow-lead">Sold Out</div>
        <h3 className="mt-2 font-display font-black uppercase text-2xl tracking-tight">All sizes gone.</h3>
        {notify.done ? (
          <p className="text-sm text-accent font-bold mt-3 tracking-[0.04em]">✓ You're on the list — we'll email you the moment {productName} is back.</p>
        ) : (
          <>
            <p className="text-sm text-ink/65 mt-2">Drop your email and we&apos;ll let you know if {productName} comes back.</p>
            <form onSubmit={submitNotify} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input name="email" type="email" required placeholder="Your email" className="flex-1 bg-bone border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
              <button disabled={notify.pending} className="btn">{notify.pending ? "Adding…" : "Notify me"}</button>
            </form>
            {notify.err ? <div className="field-error mt-2">{notify.err}</div> : null}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold">Size</div>
        <button type="button" className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent underline">Size guide</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {variants.map((v) => {
          const oos = v.stock <= 0;
          const active = selected === v.id;
          return (
            <button
              key={v.id} type="button" disabled={oos}
              onClick={() => { setSelected(v.id); setMsg(null); setAdded(false); }}
              className={`relative py-3.5 text-sm font-bold uppercase tracking-wider border-2 transition-colors ${
                oos ? "border-ink/15 text-ink/30 cursor-not-allowed bg-cream/40" :
                active ? "border-ink bg-ink text-paper" :
                "border-ink/30 hover:border-ink bg-bone"
              }`}
            >
              {v.size}
              {oos ? <span className="absolute inset-0 grid place-items-center pointer-events-none">
                <span className="block w-full border-t border-ink/20 rotate-[-12deg]" />
              </span> : null}
            </button>
          );
        })}
      </div>

      {lowStock ? (
        <div className="mt-3 text-[11px] tracking-[0.18em] uppercase font-bold text-accent">
          ▲ Only {selectedVariant!.stock} left in {selectedVariant!.size}
        </div>
      ) : null}

      {added ? (
        <div className="mt-5 border-2 border-ink p-4 flex items-center justify-between gap-3 flex-wrap" data-reveal style={{ opacity: 1 }}>
          <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-accent">✓ Added to bag</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAdded(false)} className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 hover:text-ink">Keep shopping</button>
            <Link href="/cart" className="btn">View Bag →</Link>
          </div>
        </div>
      ) : (
        <button onClick={add} disabled={pending} className="btn btn-lg btn-block mt-5">
          {pending ? "Adding…" : "Add To Bag →"}
        </button>
      )}

      {msg && !added ? (
        <div className={`mt-3 text-[11px] tracking-[0.18em] uppercase font-bold ${msg.kind === "ok" ? "text-accent" : "text-red-600"}`}>
          {msg.text}
        </div>
      ) : null}

      {/* Sticky mobile buy-bar — keeps the buy action always reachable */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur border-t-2 border-ink px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-lg leading-none">{price}</div>
          <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55 truncate">
            {selectedVariant ? `Size ${selectedVariant.size}` : "Select a size"}
          </div>
        </div>
        {added ? (
          <Link href="/cart" className="btn whitespace-nowrap">View Bag →</Link>
        ) : (
          <button onClick={add} disabled={pending} className="btn whitespace-nowrap">
            {pending ? "Adding…" : "Add To Bag →"}
          </button>
        )}
      </div>
    </div>
  );
}
