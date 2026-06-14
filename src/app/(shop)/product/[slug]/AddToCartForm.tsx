"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(shop)/cart/actions";

type Variant = { id: string; size: string; stock: number };

export function AddToCartForm({ variants, allOOS, productName }: { variants: Variant[]; allOOS: boolean; productName: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  const add = () => {
    if (!selected) { setMsg({ kind: "err", text: "Pick a size first" }); return; }
    start(async () => {
      try {
        await addToCartAction(selected, 1);
        setMsg({ kind: "ok", text: "Added to bag — keep shopping or checkout" });
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
      <div className="mt-8 border-2 border-ink p-6">
        <div className="eyebrow-lead">Sold Out</div>
        <h3 className="mt-2 font-display font-black uppercase text-2xl tracking-tight">All sizes gone.</h3>
        <p className="text-sm text-ink/65 mt-2">Drop your email and we'll let you know if {productName} comes back.</p>
        <form className="mt-4 flex gap-2">
          <input type="email" required placeholder="Your email" className="flex-1 bg-bone border-2 border-ink px-3 py-2.5 text-sm focus:outline-none" />
          <button className="btn">Notify me</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] tracking-[0.22em] uppercase font-bold">Size</div>
        <button type="button" className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent underline">Size guide</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((v) => {
          const oos = v.stock <= 0;
          const active = selected === v.id;
          return (
            <button
              key={v.id} type="button" disabled={oos}
              onClick={() => { setSelected(v.id); setMsg(null); }}
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

      <button onClick={add} disabled={pending}
        className="btn btn-lg btn-block mt-5">
        {pending ? "Adding…" : "Add To Bag →"}
      </button>

      {msg ? (
        <div className={`mt-3 text-[11px] tracking-[0.18em] uppercase font-bold ${msg.kind === "ok" ? "text-accent" : "text-red-600"}`}>
          {msg.text}
        </div>
      ) : null}
    </div>
  );
}
