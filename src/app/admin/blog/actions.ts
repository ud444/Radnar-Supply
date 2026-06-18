"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

function formToData(fd: FormData) {
  const title = String(fd.get("title") || "").trim();
  const published = fd.get("published") === "on";
  return {
    title,
    slug: slugify(String(fd.get("slug") || title)),
    excerpt: String(fd.get("excerpt") || "").trim() || null,
    body: String(fd.get("body") || ""),
    coverImage: String(fd.get("coverImage") || "").trim() || null,
    coverImageKey: String(fd.get("coverImageKey") || "").trim() || null,
    metaTitle: String(fd.get("metaTitle") || "").trim() || null,
    metaDescription: String(fd.get("metaDescription") || "").trim() || null,
    published,
  };
}

export async function createPost(fd: FormData) {
  await requireAdmin();
  const data = formToData(fd);
  if (!data.title) throw new Error("Title is required");
  const post = await db.post.create({
    data: { ...data, publishedAt: data.published ? new Date() : null },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect(`/admin/blog/${post.id}`);
}

export async function updatePost(id: string, fd: FormData) {
  await requireAdmin();
  const data = formToData(fd);
  const existing = await db.post.findUniqueOrThrow({ where: { id } });
  await db.post.update({
    where: { id },
    data: {
      ...data,
      // Stamp publishedAt the first time it goes live; keep it thereafter.
      publishedAt: data.published ? existing.publishedAt ?? new Date() : null,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
}

export async function deletePost(id: string) {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
