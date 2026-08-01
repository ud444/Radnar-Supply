"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { saveMediaImage, resetMediaImage } from "./actions";
import { Eyebrow, Button } from "@/components/admin/ui";

type Slot = { key: string; label: string; url: string };

/**
 * Each slot is a self-contained segment: its own frame, its own controls, its
 * own error. Previously the upload controls sat in a shared row and — with
 * UploadThing's stylesheet missing — escaped their cards into one merged bar.
 * The footer is `overflow-hidden` and the button wrapper `min-w-0` so a control
 * can never spill past its own segment again.
 */
export function MediaManager({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setErr = (key: string, msg: string | null) =>
    setErrors((e) => {
      const next = { ...e };
      if (msg) next[key] = msg; else delete next[key];
      return next;
    });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {slots.map((slot) => (
        <div
          key={slot.key}
          className="flex flex-col rounded-card border border-line bg-bone overflow-hidden lift-1"
        >
          <div className="px-3 pt-3 pb-2">
            <Eyebrow>{slot.label}</Eyebrow>
          </div>

          <div className="px-3">
            <div className="aspect-[4/5] rounded-control bg-paper overflow-hidden well">
              {/* Uploaded to UploadThing from the browser — no intrinsic size known here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slot.url}
                alt=""
                className={`w-full h-full object-cover transition-opacity ${busy === slot.key ? "opacity-40" : ""}`}
              />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 px-3 py-3 overflow-hidden">
            <div className="min-w-0">
              <UploadButton
                endpoint="contentImage"
                onUploadBegin={() => { setBusy(slot.key); setErr(slot.key, null); }}
                onClientUploadComplete={(files) => {
                  const url = (files[0] as any)?.ufsUrl ?? (files[0] as any)?.url;
                  if (!url) { setBusy(null); return; }
                  start(async () => { await saveMediaImage(slot.key, url); setBusy(null); router.refresh(); });
                }}
                onUploadError={(e) => { setErr(slot.key, (e as any).message); setBusy(null); }}
                appearance={{
                  button: "h-8 px-3 rounded-control bg-ink text-paper text-[12px] font-medium hover:bg-accent hover:text-paper transition-colors w-auto",
                  allowedContent: "hidden",
                  container: "w-auto",
                }}
                content={{ button: busy === slot.key ? "Uploading…" : "Replace" }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => start(async () => {
                setBusy(slot.key);
                await resetMediaImage(slot.key);
                setBusy(null);
                router.refresh();
              })}
            >
              Reset
            </Button>
          </div>

          {errors[slot.key] ? (
            <div className="px-3 pb-3 -mt-1 text-[12px] text-danger">{errors[slot.key]}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
