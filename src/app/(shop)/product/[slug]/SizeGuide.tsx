"use client";
import { useState, useEffect } from "react";

const CLOTHING = [
  ["XS", "34–36", "28–30"],
  ["S", "36–38", "30–32"],
  ["M", "38–40", "32–34"],
  ["L", "40–42", "34–36"],
  ["XL", "42–44", "36–38"],
  ["XXL", "44–46", "38–40"],
];
const SHOES = [
  ["6", "39", "7"],
  ["7", "41", "8"],
  ["8", "42", "9"],
  ["9", "43", "10"],
  ["10", "44", "11"],
  ["11", "45", "12"],
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent underline">
        Size guide
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Size guide">
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm anim-fade-in" onClick={() => setOpen(false)} />
          <div className="relative bg-paper w-full max-w-lg rounded-2xl shadow-card p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-black text-2xl uppercase tracking-tight">Size Guide</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink/50 hover:text-ink text-xl leading-none">✕</button>
            </div>

            <Table title="Clothing (inches)" head={["Size", "Chest", "Waist"]} rows={CLOTHING} />
            <div className="h-6" />
            <Table title="Footwear" head={["UK", "EU", "US"]} rows={SHOES} />

            <p className="text-[12px] text-ink/60 mt-6 leading-relaxed">
              Measurements are a guide — fit varies by brand and cut. Unsure between sizes?{" "}
              <a href="mailto:hello@radnarsupply.com" className="underline hover:text-accent">Ask us</a> before you buy.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: string[][] }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 mb-2">{title}</div>
      <table className="w-full text-sm border border-ink/12 rounded-xl overflow-hidden">
        <thead className="bg-cream">
          <tr>{head.map((h) => <th key={h} className="text-left px-3 py-2 text-[11px] tracking-[0.14em] uppercase font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-ink/10">
              {r.map((c, j) => <td key={j} className={`px-3 py-2 ${j === 0 ? "font-bold" : "text-ink/75"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
