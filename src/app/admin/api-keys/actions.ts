"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateKey, SCOPES } from "@/lib/apiKey";

export async function createKey(fd: FormData) {
  const admin = await requireAdmin();
  const name  = String(fd.get("name") || "").trim();
  if (!name) throw new Error("Name required");

  const validIds = new Set(SCOPES.map((s) => s.id));
  const scopes = fd.getAll("scopes")
    .map(String)
    .filter((s) => validIds.has(s as any));

  if (scopes.length === 0) throw new Error("Pick at least one scope");

  const { full, prefix, hash } = generateKey();
  await db.apiKey.create({
    data: {
      name,
      prefix,
      hash,
      scopes: scopes.join(","),
      createdBy: admin.id,
    },
  });

  revalidatePath("/admin/api-keys");
  // Show the full token once via query param (the page renders + clears on subsequent navigation)
  redirect(`/admin/api-keys?created=${encodeURIComponent(full)}`);
}

export async function revokeKey(id: string) {
  await requireAdmin();
  await db.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidatePath("/admin/api-keys");
}
