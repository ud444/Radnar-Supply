"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(shop)/cart/actions";

type Variant = { id: string; size: string; stock: number };

export function AddToCartForm({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const add = () => {
    if (!selected) { setMsg("Please choose a size"); return; }
    start(async () => {
      try {
        await addToCartAction(selected, 1);
        setMsg("Added to bag");
        router.refresh();
      } catch (e: any) {
        setMsg(e.message ?? "Couldn't add to bag");
      }
    });
  };

  return (
    <div className="mt-8">
      <div className="text-[11px] tracking-[0.18em] uppercase text-muted mb-2">Size</div>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((v) => {
          const oos = v.stock <= 0;
          const active = selected === v.id;
          return (
            <button
              key={v.id} type="button" disabled={oos}
              onClick={() => setSelected(v.id)}
              className={`py-3 text-sm rounded border transition-colors ${
                oos ? "border-line text-muted line-through cursor-not-allowed bg-soft" :
                active ? "border-ink bg-ink text-white" :
                "border-line hover:border-ink"
              }`}
            >{v.size}</button>
          );
        })}
      </div>
      <button onClick={add} disabled={pending}
        className="mt-5 w-full bg-ink text-white py-4 rounded-full text-sm font-medium disabled:opacity-50">
        {pending ? "Adding…" : "Add to bag"}
      </button>
      {msg ? <div className="mt-3 text-xs text-muted">{msg}</div> : null}
    </div>
  );
}
