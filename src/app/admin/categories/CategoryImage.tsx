"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { setCategoryImage, clearCategoryImage } from "./actions";
import { Button } from "@/components/admin/ui";

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
      <div className="w-14 h-16 rounded-control bg-cream border border-line overflow-hidden shrink-0">
        {imageUrl ? (
          // Uploaded to UploadThing from the browser — no intrinsic size known here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className={`w-full h-full object-cover ${busy ? "opacity-40" : ""}`} />
        ) : (
          <div className="w-full h-full grid place-items-center text-[10px] text-muted">None</div>
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
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
            button: "h-7 px-2.5 rounded-control bg-ink text-paper text-[12px] font-medium hover:bg-accent hover:text-paper transition-colors w-auto",
            allowedContent: "hidden",
            container: "w-auto items-start",
          }}
          content={{ button: imageUrl ? "Replace" : "Upload" }}
        />
        {imageUrl ? (
          <Button
            type="button" variant="ghost" size="sm"
            className="h-7 px-2.5 text-danger hover:text-danger hover:bg-danger-tint"
            onClick={() => start(async () => { setBusy(true); await clearCategoryImage(categoryId); setBusy(false); router.refresh(); })}
          >
            Delete
          </Button>
        ) : null}
        {err ? <div className="text-[11px] text-danger">{err}</div> : null}
      </div>
    </div>
  );
}
