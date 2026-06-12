"use server";
import { revalidatePath } from "next/cache";
import { addToCart, updateQty } from "@/lib/cart";

export async function addToCartAction(variantId: string, qty = 1) {
  await addToCart(variantId, qty);
  revalidatePath("/cart");
}

export async function updateQtyAction(variantId: string, qty: number) {
  await updateQty(variantId, qty);
  revalidatePath("/cart");
}
