import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Sparkline, Icon } from "@/components/admin/icons";

export default async function AdminHome() {
  await requireAdmin();

  const now = new Date();
  const since30 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
  const since60 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60);

  const [paid30, paidPrev, orders30, ordersPrev, productCount, customerCount, recent, top, paidOrders30] = await Promise.all([
    db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: since30 } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: since60, lt: since30 } }, _sum: { totalCents: true } }),
    db.order.count({ where: { createdAt: { gte: since30 } } }),
    db.order.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
    db.product.count({ where: { active: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.orderItem.groupBy({
      by: ["productName", "brandName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    // Daily revenue for sparkline
    db.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: since30 } },
      select: { totalCents: true, createdAt: true },
    }),
  ]);

  // Build 30-day sparkline buckets
  const days: number[] = Array(30).fill(0);
  for (const o of paidOrders30) {
    const idx = Math.min(29, Math.floor((now.getTime() - o.createdAt.getTime()) / 86_400_000));
    days[29 - idx] += o.totalCents;
  }

  const rev30 = paid30._sum.totalCents ?? 0;
  const revPrev = paidPrev._sum.totalCents ?? 0;
  const revDelta = revPrev > 0 ? Math.round(((rev30 - revPrev) / revPrev) * 100) : null;
  const ordersDelta = ordersPrev > 0 ? Math.round(((orders30 - ordersPrev) / ordersPrev) * 100) : null;

  const stats = [
    { label: "Revenue · last 30d", value: money(rev30), delta: revDelta, spark: days },
    { label: "Orders · last 30d",  value: orders30,    delta: ordersDelta },
    { label: "Active products",    value: productCount },
    { label: "Customers",          value: customerCount },
  ];

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Overview</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Dashboard</h1>
        </div>
        <Link href="/admin/products/new" className="bg-ink text-paper inline-flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
          <Icon.plus /> New Product
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-bone border border-ink/15 p-5">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">{s.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl">{s.value}</span>
              {s.delta !== undefined && s.delta !== null ? (
                <span className={`text-[11px] tracking-[0.16em] uppercase font-bold ${s.delta >= 0 ? "text-accent" : "text-red-600"}`}>
                  {s.delta >= 0 ? "+" : ""}{s.delta}%
                </span>
              ) : null}
            </div>
            {s.spark ? <Sparkline values={s.spark} /> : null}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-[11px] tracking-[0.22em] uppercase font-bold underline">All orders</Link>
          </div>
          <div className="bg-bone border border-ink/15 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-ink/65">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Order</th>
                  <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Email</th>
                  <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
                  <th className="text-right px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-ink/55">No orders yet.</td></tr>
                ) : recent.map((o) => (
                  <tr key={o.id} className="border-t border-ink/10 hover:bg-cream/50">
                    <td className="px-4 py-3"><Link className="hover:text-accent font-medium" href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
                    <td className="px-4 py-3 text-ink/65">{o.email}</td>
                    <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                    <td className="px-4 py-3 text-right font-medium">{money(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Top products · last 30d</h2>
          <div className="bg-bone border border-ink/15 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-ink/65">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Product</th>
                  <th className="text-right px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Units</th>
                </tr>
              </thead>
              <tbody>
                {top.length === 0 ? (
                  <tr><td colSpan={2} className="px-4 py-12 text-center text-ink/55">No sales yet.</td></tr>
                ) : top.map((t, i) => (
                  <tr key={i} className="border-t border-ink/10">
                    <td className="px-4 py-3">
                      <div className="text-[10px] tracking-[0.16em] uppercase text-ink/55 font-bold">{t.brandName}</div>
                      <div>{t.productName}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-display font-black text-xl">{t._sum.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    PAID:      "bg-green-100 text-green-800 border-green-300",
    SHIPPED:   "bg-blue-100 text-blue-800 border-blue-300",
    DELIVERED: "bg-purple-100 text-purple-800 border-purple-300",
    PENDING:   "bg-cream text-ink/65 border-ink/20",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
    FAILED:    "bg-red-100 text-red-800 border-red-300",
    REFUNDED:  "bg-orange-100 text-orange-800 border-orange-300",
  };
  return <span className={`text-[10px] px-2 py-1 border tracking-[0.14em] uppercase font-bold ${map[value] ?? "bg-cream text-ink/65 border-ink/20"}`}>{value.toLowerCase()}</span>;
}
