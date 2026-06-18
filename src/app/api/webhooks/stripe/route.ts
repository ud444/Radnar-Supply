import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { dispatchWebhook } from "@/lib/webhook";

// Stripe needs the raw, unparsed body to verify the signature.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET missing");
    return new NextResponse("misconfigured", { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (e: any) {
    console.error("stripe signature verification failed", e?.message);
    return new NextResponse("invalid signature", { status: 400 });
  }

  // Resolve the order from session metadata / id, or payment-intent metadata.
  async function findOrder(sessionId?: string, orderId?: string, paymentIntentId?: string) {
    if (orderId) {
      const o = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (o) return o;
    }
    if (sessionId) {
      const o = await db.order.findUnique({ where: { stripeSessionId: sessionId }, include: { items: true } });
      if (o) return o;
    }
    if (paymentIntentId) {
      const o = await db.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId }, include: { items: true } });
      if (o) return o;
    }
    return null;
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Only treat as paid once Stripe says payment is settled.
    if (session.payment_status !== "paid") return NextResponse.json({ ok: true });

    const order = await findOrder(
      session.id,
      session.metadata?.orderId ?? session.client_reference_id ?? undefined,
      typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    );
    if (!order) return NextResponse.json({ ok: true });

    if (order.paymentStatus !== "PAID") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          paymentMethod: session.payment_method_types?.[0] ?? "card",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : order.stripePaymentIntentId,
        },
      });

      try { await sendOrderConfirmation(order.id); } catch (e) { console.error("email", e); }
      dispatchWebhook("order.paid", {
        id: order.id, number: order.number, email: order.email,
        totalCents: order.totalCents, currency: order.currency,
        items: order.items.map((i) => ({
          sku: undefined, size: i.size, quantity: i.quantity,
          productName: i.productName, brandName: i.brandName,
          unitPriceCents: i.unitPriceCents,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = await findOrder(
      session.id,
      session.metadata?.orderId ?? session.client_reference_id ?? undefined,
      typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    );
    if (!order) return NextResponse.json({ ok: true });

    // Release reserved stock if we haven't already settled or released.
    if (order.paymentStatus === "PENDING") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        });
        for (const i of order.items) {
          await tx.variant.update({
            where: { id: i.variantId },
            data: { stock: { increment: i.quantity } },
          });
        }
      });
      dispatchWebhook("order.cancelled", { id: order.id, number: order.number, reason: "payment_failed" });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
