"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { setCategoryImage, clearCategoryImage } from "./actions";

export function CategoryImage({
  categoryId,
  imageUrl,
}: {
  categoryId: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-16 bg-cream border border-line overflow-hidden shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className={`w-full h-full object-cover ${busy ? "opacity-40" : ""}`} />
        ) : (
          <div className="w-full h-full grid place-items-center text-[9px] uppercase tracking-widest text-muted">None</div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <UploadButton
          endpoint="contentImage"
          onUploadBegin={() => { setBusy(true); setErr(null); }}
          onClientUploadComplete={(files) => {
            const f = files[0] as any;
            const url = f?.ufsUrl ?? f?.url;
            const key = f?.key;
            if (!url) { setBusy(false); return; }
            start(async () => { await setCategoryImage(categoryId, url, key); setBusy(false); router.refresh(); });
          }}
          onUploadError={(e) => { setErr(e.message); setBusy(false); }}
          appearance={{
            button: "bg-ink text-white px-3 py-1 text-[10px] tracking-[0.16em] uppercase font-bold",
            allowedContent: "hidden",
          }}
          content={{ button: imageUrl ? "Replace" : "Upload" }}
        />
        {imageUrl ? (
          <button
            type="button"
            onClick={() => start(async () => { setBusy(true); await clearCategoryImage(categoryId); setBusy(false); router.refresh(); })}
            className="text-[10px] tracking-[0.16em] uppercase font-bold text-red-600/80 hover:text-red-600 text-left"
          >
            Delete
          </button>
        ) : null}
        {err ? <div className="text-[10px] text-red-600">{err}</div> : null}
      </div>
    </div>
  );
}
