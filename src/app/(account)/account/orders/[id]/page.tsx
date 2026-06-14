import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

const STAGES = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!order) notFound();

  const cancelled = order.status === "CANCELLED";
  const stageIdx = cancelled ? -1 : STAGES.indexOf(order.status as (typeof STAGES)[number]);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow-lead">Account · Order</div>
          <h1 className="mt-2 font-display font-black text-4xl md:text-6xl uppercase display-tight font-mono">{order.number}</h1>
          <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 mt-2">
            Placed {order.createdAt.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {order.email}
          </div>
        </div>
        <Link href="/account/orders" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">
          ← All orders
        </Link>
      </div>

      {/* Status timeline */}
      <div className="mt-10">
        <div className="eyebrow-lead mb-4">Status</div>
        {cancelled ? (
          <div className="card-frame">
            <div className="font-display font-black uppercase text-xl tracking-tight text-red-700">Order cancelled.</div>
            <p className="text-sm text-ink/65 mt-1.5">If you didn't request this, contact <a href="mailto:hello@radnarsupply.com" className="underline">hello@radnarsupply.com</a>.</p>
          </div>
        ) : (
          <ol className="grid grid-cols-4 gap-0 border border-ink">
            {STAGES.map((stage, i) => {
              const reached = i <= stageIdx;
              return (
                <li key={stage} className={`p-4 ${i < 3 ? "border-r border-ink" : ""} ${reached ? "bg-ink text-paper" : "bg-paper"}`}>
                  <div className={`num-mark ${reached ? "text-accent" : "text-ink/30"}`}>{String(i + 1).padStart(2, "0")}</div>
                  <div className="font-display font-black uppercase tracking-tight mt-1">{stage.toLowerCase()}</div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Items + totals */}
      <div className="grid md:grid-cols-12 gap-10 mt-12">
        <div className="md:col-span-8">
          <div className="eyebrow-lead mb-3">Items</div>
          <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
            {order.items.map((i, idx) => (
              <li key={i.id} className="py-5 grid grid-cols-12 gap-4">
                <div className="col-span-3 md:col-span-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.imageUrl} alt="" className="aspect-[4/5] w-full object-cover bg-cream" />
                </div>
                <div className="col-span-6 md:col-span-7">
                  <div className="num-mark mb-1">{String(idx + 1).padStart(2, "0")}</div>
                  <div className="font-display font-black uppercase text-lg tracking-tight">{i.brandName}</div>
                  <div className="text-sm text-ink/80 mt-0.5">{i.productName}</div>
                  <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 mt-2">Size · {i.size} · Qty {i.quantity}</div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="font-display font-black text-xl">{money(i.unitPriceCents * i.quantity)}</div>
                  {i.quantity > 1 ? <div className="text-[11px] text-ink/55 mt-0.5">{money(i.unitPriceCents)} each</div> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <div className="card-frame">
              <div className="eyebrow-lead">Summary</div>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink/70">Subtotal</dt><dd>{money(order.subtotalCents)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/70">Delivery</dt><dd>{order.shippingCents === 0 ? "Free" : money(order.shippingCents)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/70">VAT</dt><dd>Included</dd></div>
              </dl>
              <div className="mt-5 pt-4 border-t-2 border-ink flex items-baseline justify-between">
                <div className="eyebrow-lead">Total</div>
                <div className="font-display font-black text-3xl tracking-tightest">{money(order.totalCents)}</div>
              </div>
            </div>

            <div className="card-frame mt-4">
              <div className="eyebrow-lead">Shipping</div>
              <div className="mt-3 font-display font-bold uppercase tracking-tight">{order.shipName}</div>
              <div className="text-sm text-ink/70 mt-1.5">
                {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br/>
                {order.shipCity}, {order.shipPostcode}<br/>
                {order.shipCountry}
              </div>
            </div>

            <div className="card-frame mt-4">
              <div className="eyebrow-lead">Payment</div>
              <div className="text-sm mt-3"><span className="text-ink/65">Method</span> · {order.paymentMethod ?? "—"}</div>
              <div className="text-[11px] text-ink/55 mt-1 font-mono break-all">{order.molliePaymentId ?? "—"}</div>
            </div>

            <a href={`mailto:hello@radnarsupply.com?subject=Order%20${encodeURIComponent(order.number)}`}
               className="btn btn-ghost btn-block mt-5">Need help? →</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
