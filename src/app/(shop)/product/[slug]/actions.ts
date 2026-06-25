"use server";
import { db } from "@/lib/prisma";

export type SubscribeResult = { ok: boolean; error?: string };

/** Register a shopper to be emailed when a sold-out product is restocked. */
export async function subscribeBackInStock(productId: string, email: string): Promise<SubscribeResult> {
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
