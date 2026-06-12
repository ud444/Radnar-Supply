import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import Link from "next/link";

export default async function AdminHome() {
  await requireAdmin();
  const since30 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const [revenue30, orders30, productCount, customerCount, recent, top] = await Promise.all([
    db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: since30 } }, _sum: { totalCents: true } }),
    db.order.count({ where: { createdAt: { gte: since30 } } }),
    db.product.count({ where: { active: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.orderItem.groupBy({
      by: ["productName", "brandName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Revenue · last 30d",  value: money(revenue30._sum.totalCents ?? 0) },
    { label: "Orders · last 30d",   value: orders30 },
    { label: "Active products",     value: productCount },
    { label: "Customers",           value: customerCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded p-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-muted">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div>
          <div className="flex justify-between mb-3 items-end"><h2 className="text-sm font-medium">Recent orders</h2><Link className="text-xs underline text-muted" href="/admin/orders">All orders</Link></div>
          <div className="bg-white border border-line rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-soft text-muted"><tr><th className="text-left px-4 py-2">#</th><th className="text-left px-4 py-2">Email</th><th className="text-left px-4 py-2">Status</th><th className="text-right px-4 py-2">Total</th></tr></thead>
              <tbody>
                {recent.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No orders yet.</td></tr>}
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-4 py-2"><Link className="underline" href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
                    <td className="px-4 py-2 text-muted">{o.email}</td>
                    <td className="px-4 py-2"><span className={`text-xs px-2 py-1 rounded ${o.status === "PAID" ? "bg-green-100 text-green-700" : "bg-soft text-muted"}`}>{o.status.toLowerCase()}</span></td>
                    <td className="px-4 py-2 text-right">{money(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3">Top products · last 30d</h2>
          <div className="bg-white border border-line rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-soft text-muted"><tr><th className="text-left px-4 py-2">Product</th><th className="text-right px-4 py-2">Units</th></tr></thead>
              <tbody>
                {top.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-muted">No sales yet.</td></tr>}
                {top.map((t, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2">
                      <div className="text-[10px] tracking-[0.16em] uppercase text-muted">{t.brandName}</div>
                      <div>{t.productName}</div>
                    </td>
                    <td className="px-4 py-2 text-right">{t._sum.quantity}</td>
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
