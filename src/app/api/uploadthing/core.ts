import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireAdmin } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "8MB", maxFileCount: 8 } })
    .middleware(async () => {
      const user = await requireAdmin();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.ufsUrl, key: file.key, userId: metadata.userId };
    }),

  // Admin-only: homepage / content media (hero, editorial, category tiles, blog covers)
  contentImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await requireAdmin();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),

  // Public: reference images attached to a sourcing / personal-shopping request
  sourcingImage: f({ image: { maxFileSize: "8MB", maxFileCount: 4 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
