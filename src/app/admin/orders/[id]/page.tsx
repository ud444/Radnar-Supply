import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { sendShippingUpdate, sendRefundConfirmation } from "@/lib/email";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CARRIER_OPTIONS, trackingLink } from "@/lib/tracking";
import {
  Card, Button, Field, TextareaField, SelectField, Checkbox, SectionTitle, Ident, Eyebrow,
} from "@/components/admin/ui";

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
      <Link href="/admin/orders" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All orders
      </Link>

      <div className="mt-3 pb-5 mb-6 border-b border-line">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.01em]">
            <Ident className="text-ink text-[20px] md:text-[24px]">{order.number}</Ident>
          </h1>
          <StatusBadge value={order.status} />
          <StatusBadge value={order.paymentStatus} />
        </div>
        <div className="text-sm text-muted mt-1.5">
          {order.createdAt.toLocaleString("en-GB")} · {order.email}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <SectionTitle>Items</SectionTitle>
            <Card>
              <ul className="divide-y divide-line -my-3">
                {order.items.map((i) => (
                  <li key={i.id} className="py-3 flex gap-3 text-sm items-center">
                    <Image
                      src={i.imageUrl} alt="" width={56} height={64}
                      className="w-14 h-16 object-cover rounded-[6px] bg-cream shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">{i.brandName}</div>
                      <div className="truncate">{i.productName}</div>
                      <div className="text-[12px] text-muted">Size {i.size} · qty {i.quantity}</div>
                    </div>
                    <div className="tabular-nums font-medium">{money(i.unitPriceCents * i.quantity)}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-line space-y-1.5 text-sm max-w-[240px] ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular-nums">{money(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="tabular-nums">
                    {order.shippingCents === 0 ? "Free" : money(order.shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2 mt-2 border-t border-line">
                  <span>Total</span>
                  <span className="tabular-nums">{money(order.totalCents)}</span>
                </div>
                {order.refundedCents > 0 ? (
                  <div className="flex justify-between text-warning">
                    <span>Refunded</span>
                    <span className="tabular-nums">−{money(order.refundedCents)}</span>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <div>
            <SectionTitle>Internal notes</SectionTitle>
            <form action={saveNotes}>
              <Card>
                <textarea
                  name="notes" rows={3} defaultValue={order.notes ?? ""}
                  placeholder="Private notes about this order — never shown to the customer."
                  className="w-full bg-bone border border-ink/15 rounded-control px-3 py-2.5 text-sm placeholder:text-ink/35 focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
                />
                <div className="mt-3">
                  <Button variant="secondary" size="sm">Save notes</Button>
                </div>
              </Card>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle>Fulfilment</SectionTitle>
            <form action={saveFulfilment}>
              <Card className="space-y-3.5">
                <SelectField label="Status" name="status" defaultValue={order.status}>
                  {["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </SelectField>
                <SelectField label="Carrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? ""}>
                  <option value="">— none —</option>
                  {CARRIER_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </SelectField>
                <Field label="Tracking number" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} />
                <Field
                  label="Tracking URL" hint="optional" name="trackingUrl"
                  defaultValue={order.trackingUrl ?? ""} placeholder="Overrides the carrier link"
                />
                <Checkbox label="Email the customer when shipped or delivered" name="notify" defaultChecked />
                <Button className="w-full">Save and notify</Button>
              </Card>
            </form>
          </div>

          <div>
            <SectionTitle>Shipping</SectionTitle>
            <Card className="text-sm">
              <div className="text-muted leading-relaxed">
                {order.shipName}<br />
                {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br />
                {order.shipCity}, {order.shipPostcode}<br />
                {order.shipCountry}
              </div>

              <Eyebrow className="mt-5 mb-1.5">Payment</Eyebrow>
              <div className="text-muted">Method · {order.paymentMethod ?? "—"}</div>
              <div className="text-muted break-all">
                Stripe · <Ident>{order.stripePaymentIntentId ?? order.stripeSessionId ?? "—"}</Ident>
              </div>
            </Card>
          </div>

          {(order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") && order.stripePaymentIntentId && refundable > 0 ? (
            <div>
              <SectionTitle>Refund</SectionTitle>
              <form action={refund}>
                <div className="bg-warning-tint border border-warning-line rounded-card p-5 space-y-3.5">
                  <p className="text-[13px] text-warning">
                    Up to <span className="tabular-nums font-medium">{money(refundable)}</span> refundable.
                    A full refund restocks the items and cancels the order.
                  </p>
                  <Field
                    label="Amount" hint="£" name="amount" type="number" step="0.01" min="0"
                    max={(refundable / 100).toFixed(2)}
                    defaultValue={(refundable / 100).toFixed(2)}
                    className="tabular-nums"
                  />
                  <Button variant="danger" className="w-full bg-transparent">Refund via Stripe</Button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
