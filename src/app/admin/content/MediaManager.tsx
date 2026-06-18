"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { saveMediaImage, resetMediaImage } from "./actions";

type Slot = { key: string; label: string; url: string };

export function MediaManager({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {slots.map((slot) => (
        <div key={slot.key} className="border border-line p-3 bg-white">
          <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55 mb-2">{slot.label}</div>
          <div className="aspect-[4/5] bg-soft overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.url} alt="" className={`w-full h-full object-cover transition-opacity ${busy === slot.key ? "opacity-40" : ""}`} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <UploadButton
              endpoint="contentImage"
              onUploadBegin={() => { setBusy(slot.key); setErr(null); }}
              onClientUploadComplete={(files) => {
                const url = (files[0] as any)?.ufsUrl ?? files[0]?.url;
                if (!url) { setBusy(null); return; }
                start(async () => { await saveMediaImage(slot.key, url); setBusy(null); router.refresh(); });
              }}
              onUploadError={(e) => { setErr(e.message); setBusy(null); }}
              appearance={{
                button: "bg-ink text-white px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase font-bold",
                allowedContent: "hidden",
              }}
              content={{ button: "Replace" }}
            />
            <button
              type="button"
              onClick={() => start(async () => { setBusy(slot.key); await resetMediaImage(slot.key); setBusy(null); router.refresh(); })}
              className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink/45 hover:text-ink"
            >
              Reset
            </button>
          </div>
        </div>
      ))}
      {err ? <div className="col-span-full text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
