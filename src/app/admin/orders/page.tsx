import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Icon } from "@/components/admin/icons";
import { StatusBadge } from "@/components/admin/StatusBadge";

type SP = { q?: string; status?: string };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;

  const where: any = {};
  if (sp.q)      where.OR = [{ number: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }];
  if (sp.status) where.status = sp.status;

  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" } });
  const STATUSES = ["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED"];

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Orders</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">All Orders</h1>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <form action="/admin/orders" className="flex-1 min-w-[260px] relative">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <Icon.search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search order # or email…" className="w-full bg-bone border border-ink/20 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink" />
        </form>
        <div className="flex gap-1.5 flex-wrap">
          <Link href="/admin/orders" className={`text-[11px] tracking-[0.18em] uppercase font-bold px-3 py-2 border ${!sp.status ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>All</Link>
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}${sp.q ? `&q=${sp.q}` : ""}`}
              className={`text-[11px] tracking-[0.18em] uppercase font-bold px-3 py-2 border ${sp.status === s ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>
              {s.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-bone border border-ink/15 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Order</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Date</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Customer</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Payment</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-ink/55">
                No orders match.
              </td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-t border-ink/10 hover:bg-cream/50 transition-colors">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="hover:text-accent font-medium">{o.number}</Link></td>
                <td className="px-4 py-3 text-ink/65">{o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3"><StatusBadge value={o.paymentStatus} /></td>
                <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                <td className="px-4 py-3 text-right font-medium">{money(o.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
