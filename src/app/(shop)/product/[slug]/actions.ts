"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { allow, isBot } from "@/lib/security";

export type SubscribeResult = { ok: boolean; error?: string };

/** Submit a product review — moderated, shows once an admin approves it. */
export async function submitReview(productId: string, slug: string, fd: FormData): Promise<{ ok: boolean; error?: string }> {
  if (isBot(fd)) return { ok: true };
  if (!(await allow("review", 5, 60_000))) return { ok: false, error: "Too many attempts — try again shortly." };
  const author = String(fd.get("author") || "").trim().slice(0, 60);
  const rating = Math.min(5, Math.max(0, parseInt(String(fd.get("rating") || "0"), 10) || 0));
  const body = String(fd.get("body") || "").trim().slice(0, 1000);
  if (!author || !body || rating < 1) return { ok: false, error: "Add your name, a rating and a few words." };
  await db.review.create({ data: { productId, author, rating, body } });
  revalidatePath(`/product/${slug}`);
  return { ok: true };
}

/** Register a shopper to be emailed when a sold-out product is restocked. */
export async function subscribeBackInStock(productId: string, email: string): Promise<SubscribeResult> {
  if (!(await allow("backinstock", 10, 60_000))) return { ok: false, error: "Too many attempts — try again shortly." };
  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, error: "Enter a valid email" };
  try {
    await db.stockNotice.upsert({
      where: { productId_email: { productId, email: e } },
      update: { notifiedAt: null }, // re-arm if they ask again after a previous notice
      create: { productId, email: e },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't sign you up — please try again." };
  }
}
