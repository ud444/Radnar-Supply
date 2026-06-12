"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";
import { updateQtyAction } from "./actions";

type Line = {
  variantId: string; qty: number; productName: string; brandName: string; size: string;
  imageUrl: string; unitCents: number; lineCents: number; slug: string; stock: number;
};

export function CartLines({ lines }: { lines: Line[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const update = (variantId: string, qty: number) => {
    start(async () => { await updateQtyAction(variantId, qty); router.refresh(); });
  };

  return (
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((l) => (
        <li key={l.variantId} className="py-5 flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.imageUrl} alt="" className="w-24 h-32 object-cover rounded bg-soft" />
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.16em] uppercase text-muted">{l.brandName}</div>
            <div className="text-sm">{l.productName}</div>
            <div className="text-xs text-muted mt-0.5">Size · {l.size}</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="inline-flex border border-line rounded">
                <button disabled={pending} onClick={() => update(l.variantId, Math.max(1, l.qty - 1))} className="w-8 h-8 text-sm">−</button>
                <span className="w-8 h-8 grid place-items-center text-sm">{l.qty}</span>
                <button disabled={pending || l.qty >= l.stock} onClick={() => update(l.variantId, l.qty + 1)} className="w-8 h-8 text-sm disabled:opacity-30">+</button>
              </div>
              <button onClick={() => update(l.variantId, 0)} className="text-xs text-muted underline">Remove</button>
            </div>
          </div>
          <div className="text-sm font-medium">{money(l.lineCents)}</div>
        </li>
      ))}
    </ul>
  );
}
