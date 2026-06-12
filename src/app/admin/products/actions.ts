"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function createProduct(fd: FormData) {
  await requireAdmin();
  const name = String(fd.get("name"));
  const slug = slugify(String(fd.get("slug") || name));
  const product = await db.product.create({
    data: {
      name, slug, description: String(fd.get("description")),
      priceCents: Math.round(Number(fd.get("price")) * 100),
      brandId: String(fd.get("brandId")),
      categoryId: String(fd.get("categoryId")),
      featured: fd.get("featured") === "on",
      active: fd.get("active") === "on",
    },
  });
  const sizes = String(fd.get("sizes") || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const size of sizes) {
    const sku = `${slug}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    await db.variant.create({ data: { productId: product.id, size, sku, stock: 0 } });
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, fd: FormData) {
  await requireAdmin();
  await db.product.update({
    where: { id },
    data: {
      name: String(fd.get("name")),
      description: String(fd.get("description")),
      priceCents: Math.round(Number(fd.get("price")) * 100),
      brandId: String(fd.get("brandId")),
      categoryId: String(fd.get("categoryId")),
      featured: fd.get("featured") === "on",
      active: fd.get("active") === "on",
    },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function setVariantStock(variantId: string, stock: number) {
  await requireAdmin();
  await db.variant.update({ where: { id: variantId }, data: { stock } });
  revalidatePath("/admin/products");
}

export async function addVariant(productId: string, size: string) {
  await requireAdmin();
  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });
  const sku = `${product.slug}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  await db.variant.create({ data: { productId, size, sku, stock: 0 } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdmin();
  await db.variant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveUploadedImages(productId: string, files: { url: string; key: string }[]) {
  await requireAdmin();
  const existing = await db.productImage.count({ where: { productId } });
  await db.productImage.createMany({
    data: files.map((f, i) => ({
      productId, url: f.url, key: f.key, position: existing + i,
    })),
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteImage(imageId: string, productId: string) {
  await requireAdmin();
  await db.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${productId}`);
}
