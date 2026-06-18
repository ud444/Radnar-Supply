"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
      {lines.map((l, i) => (
        <li key={l.variantId} className={`py-6 flex gap-4 md:grid md:grid-cols-12 md:gap-6 ${pending ? "opacity-60" : ""} transition-opacity`}>
          {/* Image */}
          <Link href={`/product/${l.slug}`} className="w-24 shrink-0 md:w-auto md:col-span-2">
            <div className="aspect-[4/5] bg-cream overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.imageUrl} alt="" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500" />
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0 md:col-span-7 flex flex-col">
            <div className="num-mark mb-1">{String(i + 1).padStart(2, "0")}</div>
            <Link href={`/product/${l.slug}`} className="font-display font-black uppercase text-lg md:text-xl tracking-tight leading-tight hover:text-accent">
              {l.brandName}
            </Link>
            <div className="text-sm text-ink/85 mt-0.5">{l.productName}</div>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55">Size · {l.size}</div>
              {/* Price inline on mobile only */}
              <div className="font-display font-black text-lg md:hidden">{money(l.lineCents)}</div>
            </div>

            {/* Qty + remove */}
            <div className="mt-auto pt-4 flex items-center gap-3 flex-wrap">
              <div className="inline-flex border-2 border-ink">
                <button aria-label="Decrease quantity" disabled={pending || l.qty <= 1} onClick={() => update(l.variantId, l.qty - 1)}
                  className="w-11 h-11 md:w-9 md:h-9 text-base font-bold hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink">−</button>
                <span className="w-11 h-11 md:w-9 md:h-9 grid place-items-center text-sm font-bold border-x-2 border-ink">{l.qty}</span>
                <button aria-label="Increase quantity" disabled={pending || l.qty >= l.stock} onClick={() => update(l.variantId, l.qty + 1)}
                  className="w-11 h-11 md:w-9 md:h-9 text-base font-bold hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink">+</button>
              </div>
              <button onClick={() => update(l.variantId, 0)} disabled={pending}
                className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 hover:text-accent">
                Remove
              </button>
              {l.qty >= l.stock ? (
                <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-accent">Max stock</span>
              ) : null}
            </div>
          </div>

          {/* Price — desktop column */}
          <div className="hidden md:block md:col-span-3 text-right">
            <div className="font-display font-black text-xl md:text-2xl">{money(l.lineCents)}</div>
            {l.qty > 1 ? <div className="text-[11px] text-ink/55 mt-0.5">{money(l.unitCents)} each</div> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
