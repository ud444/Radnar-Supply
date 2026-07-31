"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { saveMediaImage, resetMediaImage } from "./actions";
import { Eyebrow, Button } from "@/components/admin/ui";

type Slot = { key: string; label: string; url: string };

export function MediaManager({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {slots.map((slot) => (
        <div key={slot.key} className="rounded-card border border-line bg-bone p-3">
          <Eyebrow className="mb-2">{slot.label}</Eyebrow>
          <div className="aspect-[4/5] rounded-control bg-cream overflow-hidden mb-3">
            {/* Uploaded to UploadThing from the browser — no intrinsic size known here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.url} alt=""
              className={`w-full h-full object-cover transition-opacity ${busy === slot.key ? "opacity-40" : ""}`}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <UploadButton
              endpoint="contentImage"
              onUploadBegin={() => { setBusy(slot.key); setErr(null); }}
              onClientUploadComplete={(files) => {
                const url = (files[0] as any)?.ufsUrl ?? (files[0] as any)?.url;
                if (!url) { setBusy(null); return; }
                start(async () => { await saveMediaImage(slot.key, url); setBusy(null); router.refresh(); });
              }}
              onUploadError={(e) => { setErr((e as any).message); setBusy(null); }}
              appearance={{
                button: "h-8 px-3 rounded-control bg-ink text-paper text-[12px] font-medium hover:bg-accent transition-colors",
                allowedContent: "hidden",
              }}
              content={{ button: "Replace" }}
            />
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => start(async () => { setBusy(slot.key); await resetMediaImage(slot.key); setBusy(null); router.refresh(); })}
            >
              Reset
            </Button>
          </div>
        </div>
      ))}
      {err ? <div className="col-span-full text-[12px] text-danger">{err}</div> : null}
    </div>
  );
}
