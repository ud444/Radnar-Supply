"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { saveUploadedImages } from "../actions";

type Img = { id: string; url: string; alt: string | null };

export function ProductImages({
  productId, images, deleteImage,
}: {
  productId: string;
  images: Img[];
  deleteImage: (imageId: string, productId: string) => Promise<void>;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-[4/5] rounded overflow-hidden bg-soft group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => start(async () => { await deleteImage(img.id, productId); router.refresh(); })}
              className="absolute top-1 right-1 bg-white/90 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <UploadButton
          endpoint="productImage"
          onClientUploadComplete={(files) => {
            start(async () => {
              await saveUploadedImages(
                productId,
                files.map((f) => ({ url: (f as any).ufsUrl ?? f.url, key: f.key })),
              );
              router.refresh();
            });
          }}
          onUploadError={(e) => setErr(e.message)}
          appearance={{ button: "bg-ink text-white px-4 py-2 rounded text-sm" }}
        />
        {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
      </div>
    </div>
  );
}
