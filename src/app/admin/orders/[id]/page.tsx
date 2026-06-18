import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { sendShippingUpdate } from "@/lib/email";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  async function setStatus(fd: FormData) {
    "use server";
    await requireAdmin();
    const newStatus = String(fd.get("status")) as any;
    const updated = await db.order.update({ where: { id }, data: { status: newStatus } });
    if (newStatus === "SHIPPED") {
      try { await sendShippingUpdate(id); } catch (e) { console.error(e); }
    }
    const { dispatchWebhook } = await import("@/lib/webhook");
    const eventMap: Record<string, any> = {
      SHIPPED:   "order.shipped",
      DELIVERED: "order.delivered",
      CANCELLED: "order.cancelled",
      PAID:      "order.paid",
    };
    if (eventMap[newStatus]) {
      dispatchWebhook(eventMap[newStatus], {
        id: updated.id, number: updated.number, status: updated.status,
        email: updated.email, totalCents: updated.totalCents,
      });
    }
    revalidatePath(`/admin/orders/${id}`);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted">Order</div>
          <h1 className="text-2xl font-display font-semibold tracking-tightest">{order.number}</h1>
          <div className="text-sm text-muted mt-1">{order.createdAt.toLocaleString("en-GB")} · {order.email}</div>
        </div>
        <form action={setStatus} className="flex gap-2">
          <select name="status" defaultValue={order.status} className="border border-line rounded px-3 py-2 text-sm">
            {["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
          </select>
          <button className="bg-ink text-white px-4 py-2 rounded text-sm">Update</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-white border border-line rounded p-6">
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
          </div>
        </div>

        <div className="bg-white border border-line rounded p-6 text-sm">
          <div className="font-medium mb-2">Shipping</div>
          <div className="text-muted">{order.shipName}<br/>{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br/>{order.shipCity}, {order.shipPostcode}<br/>{order.shipCountry}</div>
          <div className="font-medium mt-6 mb-2">Payment</div>
          <div className="text-muted">Method · {order.paymentMethod ?? "—"}</div>
          <div className="text-muted">Stripe · {order.stripePaymentIntentId ?? order.stripeSessionId ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
