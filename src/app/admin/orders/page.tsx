import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Orders</h1>
      <div className="mt-6 bg-white border border-line rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-soft text-muted">
            <tr>
              <th className="text-left px-4 py-2">Number</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Payment</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-4 py-2"><Link href={`/admin/orders/${o.id}`} className="underline">{o.number}</Link></td>
                <td className="px-4 py-2 text-muted">{o.createdAt.toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-2">{o.email}</td>
                <td className="px-4 py-2"><Badge value={o.paymentStatus} ok="PAID" bad="FAILED" /></td>
                <td className="px-4 py-2"><Badge value={o.status} ok="PAID" bad="CANCELLED" /></td>
                <td className="px-4 py-2 text-right">{money(o.totalCents)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Badge({ value, ok, bad }: { value: string; ok: string; bad: string }) {
  const cls = value === ok ? "bg-green-100 text-green-700" : value === bad ? "bg-red-100 text-red-700" : "bg-soft text-muted";
  return <span className={`text-xs px-2 py-1 rounded ${cls}`}>{value.toLowerCase()}</span>;
}
