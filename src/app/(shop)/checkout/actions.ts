"use server";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/prisma";
import { getCart, clearCart } from "@/lib/cart";
import { mollie, siteUrl } from "@/lib/mollie";
import { getSession } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { shippingAddressSchema } from "@/lib/validators";

const orderNum = customAlphabet("0123456789", 6);

export type CheckoutResult = { ok: true; checkoutUrl: string } | { ok: false; error: string };

export async function placeOrder(_: unknown, formData: FormData): Promise<CheckoutResult> {
  try {
    const data = shippingAddressSchema.parse(Object.fromEntries(formData));
    const cart = await getCart();
    if (!cart.lines.length) return { ok: false, error: "Cart is empty" };
    const session = await getSession();

    const result = await db.$transaction(async (tx) => {
      // Re-validate stock and recompute totals server-side (never trust the client view)
      const variants = await tx.variant.findMany({
        where: { id: { in: cart.lines.map((l: any) => l.variantId) } },
        include: {
          product: {
            include: {
              brand: true,
              images: { take: 1, orderBy: { position: "asc" } },
            },
          },
        },
      });

      let subtotal = 0;
      const items = cart.lines.map((l: any) => {
        const v = variants.find((x) => x.id === l.variantId);
        if (!v) throw new Error("A product in your bag is no longer available");
        if (v.stock < l.qty) throw new Error(`${v.product.name} (${v.size}): only ${v.stock} left`);
        subtotal += v.product.priceCents * l.qty;
        return {
          variantId: v.id, productName: v.product.name, brandName: v.product.brand.name,
          size: v.size, imageUrl: v.product.images[0]?.url ?? "",
          unitPriceCents: v.product.priceCents, quantity: l.qty,
        };
      });

      const flat      = await getSetting<number>("shipping.flat_rate_pence",     495);
      const freeAbove = await getSetting<number>("shipping.free_threshold_pence", 7500);
      const shipping  = subtotal >= freeAbove ? 0 : flat;
      const total     = subtotal + shipping;

      const number = `RS-${new Date().getFullYear()}-${orderNum()}`;
      const order  = await tx.order.create({
        data: {
          number, userId: session?.userId, email: data.email,
          subtotalCents: subtotal, shippingCents: shipping, totalCents: total,
          shipName: data.name, shipLine1: data.line1, shipLine2: data.line2,
          shipCity: data.city, shipPostcode: data.postcode, shipPhone: data.phone,
          items: { create: items },
        },
      });

      // Reserve stock (released by webhook if payment cancelled/expired)
      for (const i of items) {
        await tx.variant.update({
          where: { id: i.variantId },
          data: { stock: { decrement: i.quantity } },
        });
      }

      return { orderId: order.id, number, total };
    });

    const payment = await mollie().payments.create({
      amount: { currency: "GBP", value: (result.total / 100).toFixed(2) },
      description: `Radnar Supply ${result.number}`,
      redirectUrl: `${siteUrl()}/checkout/success?o=${result.number}`,
      webhookUrl: `${siteUrl()}/api/webhooks/mollie`,
      metadata: { orderId: result.orderId },
    });
    await db.order.update({ where: { id: result.orderId }, data: { molliePaymentId: payment.id } });
    await clearCart();
    return { ok: true, checkoutUrl: payment.getCheckoutUrl()! };
  } catch (e: any) {
    console.error("placeOrder", e);
    return { ok: false, error: e.message ?? "Could not place order" };
  }
}
