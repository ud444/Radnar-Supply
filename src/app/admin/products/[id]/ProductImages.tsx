"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { saveUploadedImages } from "../actions";
import { EmptyState } from "@/components/admin/ui";

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
      {images.length === 0 ? (
        <EmptyState
          title="No images yet"
          hint="The first image is used as the product thumbnail across the storefront."
        />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-[4/5] rounded-control overflow-hidden bg-cream border border-line group"
            >
              {/* Uploaded to UploadThing from the browser — no intrinsic size known here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => start(async () => { await deleteImage(img.id, productId); router.refresh(); })}
                className="absolute top-1.5 right-1.5 rounded-[6px] bg-bone/95 text-danger text-[11px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <UploadButton
          endpoint="productImage"
          onClientUploadComplete={(files) => {
            start(async () => {
              await saveUploadedImages(
                productId,
                files.map((f) => ({ url: (f as any).ufsUrl ?? (f as any).url, key: (f as any).key })),
              );
              router.refresh();
            });
          }}
          onUploadError={(e) => setErr((e as any).message)}
          appearance={{
            button: "h-9 px-3.5 rounded-control bg-ink text-paper text-[13px] font-medium hover:bg-accent transition-colors",
            allowedContent: "hidden",
          }}
        />
        {err ? <div className="mt-2 text-[12px] text-danger">{err}</div> : null}
      </div>
    </div>
  );
}
