import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SelectAll } from "./SelectAll";
import {
  PageHeader, btn, Button, Toolbar, SearchInput, FilterTabs, TableWrap,
  Table, THead, Th, Tr, Td, EmptyState, Pagination, Eyebrow, Ident,
} from "@/components/admin/ui";

type SP = { q?: string; status?: string; page?: string };

const PER_PAGE = 25;

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

  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: PER_PAGE, skip: (page - 1) * PER_PAGE }),
    db.order.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageHref = (n: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (sp.status) u.set("status", sp.status);
    if (n > 1) u.set("page", String(n));
    return `/admin/orders${u.toString() ? `?${u}` : ""}`;
  };
  const exportQs = new URLSearchParams();
  if (sp.q) exportQs.set("q", sp.q);
  if (sp.status) exportQs.set("status", sp.status);

  const qs = sp.q ? `q=${encodeURIComponent(sp.q)}` : "";
  const tabs = [
    { href: "/admin/orders", label: "All", active: !sp.status },
    ...STATUSES.map((s) => ({
      href: `/admin/orders?status=${s}${qs ? `&${qs}` : ""}`,
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      active: sp.status === s,
    })),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title="All orders"
        actions={
          // Plain anchor, not next/link: this hits a route handler that streams a
          // CSV download, which client-side navigation would swallow.
          <a
            href={`/admin/orders/export${exportQs.toString() ? `?${exportQs}` : ""}`}
            className={btn("secondary")}
          >
            Export CSV
          </a>
        }
      />

      <Toolbar>
        <form action="/admin/orders" className="flex-1 min-w-[240px]">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <SearchInput defaultValue={sp.q ?? ""} placeholder="Search order number or email…" />
        </form>
        <FilterTabs items={tabs} />
      </Toolbar>

      <form action={bulkUpdate}>
        {/* Bulk action bar — sits flush on top of the table */}
        <div className="flex flex-wrap items-center gap-3 bg-cream border border-line rounded-t-card px-4 py-3 text-sm">
          <Eyebrow>Bulk action</Eyebrow>
          <select
            name="bulkStatus"
            defaultValue="SHIPPED"
            className="h-8 rounded-control border border-ink/15 bg-bone px-2.5 text-[13px] focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>Mark {s.toLowerCase()}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            <input type="checkbox" name="notify" defaultChecked className="w-4 h-4 accent-ink" />
            Email the customer
          </label>
          <Button size="sm" className="ml-auto">Apply to selected</Button>
        </div>

        <TableWrap className="rounded-t-none border-t-0">
          <Table>
            <THead>
              <tr>
                <Th className="w-10"><SelectAll /></Th>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th align="right">Total</Th>
              </tr>
            </THead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <EmptyState
                      title={sp.q || sp.status ? "No orders match" : "No orders yet"}
                      hint={
                        sp.q || sp.status
                          ? "Try clearing the search or choosing a different status."
                          : "Orders appear here the moment a checkout completes."
                      }
                    />
                  </Td>
                </tr>
              ) : orders.map((o) => (
                <Tr key={o.id}>
                  <Td><input type="checkbox" name="ids" value={o.id} className="w-4 h-4 accent-ink" /></Td>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent transition-colors">
                      <Ident className="text-ink">{o.number}</Ident>
                    </Link>
                  </Td>
                  <Td className="text-muted whitespace-nowrap">
                    {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </Td>
                  <Td>{o.email}</Td>
                  <Td><StatusBadge value={o.paymentStatus} /></Td>
                  <Td><StatusBadge value={o.status} /></Td>
                  <Td align="right" numeric className="font-medium">{money(o.totalCents)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </form>

      <Pagination page={page} pages={pages} total={total} noun="orders" hrefFor={pageHref} />
    </div>
  );
}
