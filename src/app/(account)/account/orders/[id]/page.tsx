import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!order) notFound();
  return (
    <div>
      <div className="text-[11px] tracking-[0.18em] uppercase text-muted">Order</div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest mt-1">{order.number}</h1>
      <div className="text-sm text-muted mt-1">{order.createdAt.toLocaleString("en-GB")} · {order.status.toLowerCase()}</div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((i) => (
          <li key={i.id} className="py-4 flex gap-4 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.imageUrl} alt="" className="w-16 h-20 object-cover rounded bg-soft" />
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
      <div className="mt-8 text-sm">
        <div className="font-medium">Shipping</div>
        <div className="text-muted mt-1">{order.shipName}<br/>{order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br/>{order.shipCity}, {order.shipPostcode}<br/>{order.shipCountry}</div>
      </div>
    </div>
  );
}
