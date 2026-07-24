"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

/** Save (or replace) a category's tile image after an UploadThing upload. */
export async function setCategoryImage(categoryId: string, url: string, key: string) {
  await requireAdmin();
  await db.category.update({ where: { id: categoryId }, data: { imageUrl: url, imageKey: key } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}

/** Remove a category's tile image (storefront falls back to the default). */
export async function clearCategoryImage(categoryId: string) {
  await requireAdmin();
  await db.category.update({ where: { id: categoryId }, data: { imageUrl: null, imageKey: null } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}
