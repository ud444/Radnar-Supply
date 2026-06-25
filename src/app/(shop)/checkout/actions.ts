"use server";
import type Stripe from "stripe";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/prisma";
import { getCart, clearCart } from "@/lib/cart";
import { stripe, siteUrl } from "@/lib/stripe";
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

      return { orderId: order.id, number, total, shipping, items };
    });

    // Build itemised Stripe line items (+ shipping as its own line if charged)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      result.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: i.unitPriceCents,
          product_data: {
            name: `${i.brandName} — ${i.productName}`,
            description: `Size ${i.size}`,
            ...(i.imageUrl ? { images: [i.imageUrl] } : {}),
          },
        },
      }));
    if (result.shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: result.shipping,
          product_data: { name: "Standard Tracked Delivery" },
        },
      });
    }

    const checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: data.email,
      allow_promotion_codes: true, // lets shoppers apply codes like RADNAR10 (create them in Stripe)
      client_reference_id: result.orderId,
      metadata: { orderId: result.orderId, number: result.number },
      payment_intent_data: { metadata: { orderId: result.orderId, number: result.number } },
      success_url: `${siteUrl()}/checkout/success?o=${result.number}`,
      cancel_url: `${siteUrl()}/checkout/cancelled?o=${result.number}`,
    });

    await db.order.update({
      where: { id: result.orderId },
      data: {
        stripeSessionId: checkout.id,
        stripePaymentIntentId:
          typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      },
    });
    await clearCart();
    return { ok: true, checkoutUrl: checkout.url! };
  } catch (e: any) {
    console.error("placeOrder", e);
    return { ok: false, error: e.message ?? "Could not place order" };
  }
}
