import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Icon } from "@/components/admin/icons";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SelectAll } from "./SelectAll";

type SP = { q?: string; status?: string };

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

// Bulk: apply a status to every selected order (and email on SHIPPED if asked).
async function bulkUpdate(fd: FormData) {
  "use server";
  await requireAdmin();
  const ids = fd.getAll("ids").map(String).filter(Boolean);
  const status = String(fd.get("bulkStatus") || "");
  const notify = fd.get("notify") === "on";
  if (!ids.length || !STATUSES.includes(status)) return;

  await db.order.updateMany({ where: { id: { in: ids } }, data: { status: status as any } });

  const { dispatchWebhook } = await import("@/lib/webhook");
  const eventMap: Record<string, any> = {
    SHIPPED: "order.shipped", DELIVERED: "order.delivered", CANCELLED: "order.cancelled", PAID: "order.paid",
  };
  for (const id of ids) {
    const o = await db.order.findUnique({ where: { id } });
    if (!o) continue;
    if (status === "SHIPPED" && notify) {
      const { sendShippingUpdate } = await import("@/lib/email");
      try { await sendShippingUpdate(id, o.trackingUrl ?? undefined); } catch (e) { console.error(e); }
    }
    if (status === "DELIVERED" && notify) {
      const { sendDelivered } = await import("@/lib/email");
      try { await sendDelivered(id); } catch (e) { console.error(e); }
    }
    if (eventMap[status]) {
      dispatchWebhook(eventMap[status], { id: o.id, number: o.number, status: o.status, email: o.email, totalCents: o.totalCents });
    }
  }
  revalidatePath("/admin/orders");
}

export default async function AdminOrders({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;

  const where: any = {};
  if (sp.q)      where.OR = [{ number: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }];
  if (sp.status) where.status = sp.status;

  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" } });
  const exportQs = new URLSearchParams();
  if (sp.q) exportQs.set("q", sp.q);
  if (sp.status) exportQs.set("status", sp.status);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Orders</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">All Orders</h1>
        </div>
        <a href={`/admin/orders/export${exportQs.toString() ? `?${exportQs}` : ""}`}
          className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-ink hover:text-paper transition-colors">
          Export CSV
        </a>
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

      <form action={bulkUpdate} className="mt-6">
        {/* Bulk action bar */}
        <div className="flex flex-wrap items-center gap-3 bg-cream border border-ink/15 border-b-0 px-4 py-3 text-sm">
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55">Bulk action</span>
          <select name="bulkStatus" defaultValue="SHIPPED" className="border border-ink/20 px-3 py-1.5 text-sm bg-bone">
            {STATUSES.map((s) => <option key={s} value={s}>Mark {s.toLowerCase()}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-ink/70">
            <input type="checkbox" name="notify" defaultChecked className="w-4 h-4" />
            Email on shipped
          </label>
          <button className="bg-ink text-paper px-4 py-1.5 text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-accent transition-colors">
            Apply to selected
          </button>
        </div>

        <div className="bg-bone border border-ink/15 overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-cream text-ink/65">
              <tr>
                <th className="w-10 px-4 py-2.5"><SelectAll /></th>
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
                <tr><td colSpan={7} className="px-4 py-16 text-center text-ink/55">No orders match.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-t border-ink/10 hover:bg-cream/50 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" name="ids" value={o.id} className="w-4 h-4" /></td>
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
      </form>
    </div>
  );
}
