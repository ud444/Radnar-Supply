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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
