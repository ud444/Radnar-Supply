import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { sendShippingUpdate, sendRefundConfirmation } from "@/lib/email";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CARRIER_OPTIONS, trackingLink } from "@/lib/tracking";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const refundable = Math.max(0, order.totalCents - order.refundedCents);

  // Save fulfilment: status + tracking, optionally email the customer.
  async function saveFulfilment(fd: FormData) {
    "use server";
    await requireAdmin();
    const newStatus = String(fd.get("status")) as any;
    const carrier = String(fd.get("trackingCarrier") || "") || null;
    const number  = String(fd.get("trackingNumber") || "") || null;
    const urlIn   = String(fd.get("trackingUrl") || "") || null;
    const notify  = fd.get("notify") === "on";
    const url = trackingLink(carrier, number, urlIn);

    const updated = await db.order.update({
      where: { id },
      data: { status: newStatus, trackingCarrier: carrier, trackingNumber: number, trackingUrl: url },
    });

    if (notify && newStatus === "SHIPPED") {
      try { await sendShippingUpdate(id, url ?? undefined); } catch (e) { console.error(e); }
    }
    if (notify && newStatus === "DELIVERED") {
      const { sendDelivered } = await import("@/lib/email");
      try { await sendDelivered(id); } catch (e) { console.error(e); }
    }

    const { dispatchWebhook } = await import("@/lib/webhook");
    const eventMap: Record<string, any> = {
      SHIPPED: "order.shipped", DELIVERED: "order.delivered", CANCELLED: "order.cancelled", PAID: "order.paid",
    };
    if (eventMap[newStatus]) {
      dispatchWebhook(eventMap[newStatus], {
        id: updated.id, number: updated.number, status: updated.status,
        email: updated.email, totalCents: updated.totalCents, trackingUrl: url ?? undefined,
      });
    }
    revalidatePath(`/admin/orders/${id}`);
  }

  async function saveNotes(fd: FormData) {
    "use server";
    await requireAdmin();
    await db.order.update({ where: { id }, data: { notes: String(fd.get("notes") || "") || null } });
    revalidatePath(`/admin/orders/${id}`);
  }

  async function refund(fd: FormData) {
    "use server";
    await requireAdmin();
    const current = await db.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const remaining = Math.max(0, current.totalCents - current.refundedCents);
    const pounds = parseFloat(String(fd.get("amount") || "0"));
    const amount = Math.min(remaining, Math.round((isNaN(pounds) ? 0 : pounds) * 100));
    if (amount <= 0) return;
    if (!current.stripePaymentIntentId) throw new Error("No Stripe payment to refund");

    await stripe().refunds.create({ payment_intent: current.stripePaymentIntentId, amount });

    const refundedTotal = current.refundedCents + amount;
    const fullyRefunded = refundedTotal >= current.totalCents;
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          refundedCents: refundedTotal,
          paymentStatus: "REFUNDED",
          ...(fullyRefunded ? { status: "CANCELLED" } : {}),
        },
      });
      // Restock only when the whole order is refunded (treat as cancelled/returned).
      if (fullyRefunded) {
        for (const i of current.items) {
          await tx.variant.update({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
        }
      }
    });

    try { await sendRefundConfirmation(id, amount); } catch (e) { console.error(e); }
    const { dispatchWebhook } = await import("@/lib/webhook");
    dispatchWebhook("order.refunded", { id, number: current.number, amountCents: amount, fullyRefunded });
    revalidatePath(`/admin/orders/${id}`);
  }

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← All orders</Link>
      <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-semibold tracking-tightest">{order.number}</h1>
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
          </div>
          <div className="text-sm text-muted mt-1">{order.createdAt.toLocaleString("en-GB")} · {order.email}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-line rounded p-6">
            <div className="text-sm font-medium mb-3">Items</div>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="py-3 flex gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.imageUrl} alt="" className="w-14 h-16 object-cover rounded bg-soft" />
                  <div className="flex-1">
                    <div className="text-[11px] tracking-[0.16em] uppercase text-muted">{i.brandName}</div>
                    <div>{i.productName}</div>
                    <div className="text-xs text-muted">Size {i.size} · qty {i.quantity}</div>
                  </div>
                  <div>{money(i.unitPriceCents * i.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-sm max-w-xs ml-auto">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotalCents)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCents === 0 ? "Free" : money(order.shippingCents)}</span></div>
              <div className="flex justify-between font-medium pt-2 border-t border-line mt-2"><span>Total</span><span>{money(order.totalCents)}</span></div>
              {order.refundedCents > 0 ? (
                <div className="flex justify-between text-orange-700"><span>Refunded</span><span>−{money(order.refundedCents)}</span></div>
              ) : null}
            </div>
          </div>

          {/* Internal notes */}
          <form action={saveNotes} className="bg-white border border-line rounded p-6">
            <div className="text-sm font-medium mb-2">Internal notes</div>
            <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} placeholder="Private notes about this order…"
              className="w-full border border-line px-3 py-2 text-sm" />
            <button className="mt-3 bg-ink text-white px-4 py-2 rounded text-sm">Save notes</button>
          </form>
        </div>

        <div className="space-y-6">
          {/* Fulfilment */}
          <form action={saveFulfilment} className="bg-white border border-line rounded p-6 text-sm space-y-3">
            <div className="font-medium">Fulfilment</div>
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Status</span>
              <select name="status" defaultValue={order.status} className="mt-1 w-full border border-line px-3 py-2 text-sm">
                {["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Carrier</span>
              <select name="trackingCarrier" defaultValue={order.trackingCarrier ?? ""} className="mt-1 w-full border border-line px-3 py-2 text-sm">
                <option value="">— none —</option>
                {CARRIER_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Tracking number</span>
              <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="mt-1 w-full border border-line px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Tracking URL (optional)</span>
              <input name="trackingUrl" defaultValue={order.trackingUrl ?? ""} placeholder="Overrides carrier link" className="mt-1 w-full border border-line px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 pt-1">
              <input type="checkbox" name="notify" defaultChecked className="w-4 h-4" />
              <span className="text-xs text-ink/70">Email customer when status is "shipped"</span>
            </label>
            <button className="bg-ink text-white py-2.5 rounded text-sm font-medium w-full">Save & notify</button>
          </form>

          {/* Shipping address */}
          <div className="bg-white border border-line rounded p-6 text-sm">
            <div className="font-medium mb-2">Shipping</div>
            <div className="text-muted">{order.shipName}<br/>{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br/>{order.shipCity}, {order.shipPostcode}<br/>{order.shipCountry}</div>
            <div className="font-medium mt-6 mb-2">Payment</div>
            <div className="text-muted">Method · {order.paymentMethod ?? "—"}</div>
            <div className="text-muted break-all">Stripe · {order.stripePaymentIntentId ?? order.stripeSessionId ?? "—"}</div>
          </div>

          {/* Refund */}
          {(order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") && order.stripePaymentIntentId && refundable > 0 ? (
            <form action={refund} className="bg-white border border-orange-300 rounded p-6 text-sm space-y-3">
              <div className="font-medium text-orange-800">Refund</div>
              <p className="text-xs text-ink/60">Up to {money(refundable)} refundable. Full refunds restock the items.</p>
              <label className="block">
                <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Amount (£)</span>
                <input name="amount" type="number" step="0.01" min="0" max={(refundable / 100).toFixed(2)}
                  defaultValue={(refundable / 100).toFixed(2)} className="mt-1 w-full border border-line px-3 py-2 text-sm" />
              </label>
              <button className="bg-orange-600 text-white py-2.5 rounded text-sm font-medium w-full hover:bg-orange-700">Refund via Stripe</button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
