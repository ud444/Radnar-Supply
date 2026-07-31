import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Sparkline, Icon } from "@/components/admin/icons";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  PageHeader, ButtonLink, StatCard, SectionTitle, TableWrap, Table, THead,
  Th, Tr, Td, EmptyState, Num, Ident,
} from "@/components/admin/ui";

export default async function AdminHome() {
  await requireAdmin();

  const now = new Date();
  const since30 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
  const since60 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60);

  const [paid30, paidPrev, orders30, ordersPrev, productCount, customerCount, recent, top, paidOrders30, newRequests] = await Promise.all([
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
    db.sourcingRequest.count({ where: { status: "NEW" } }),
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
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        actions={
          <ButtonLink href="/admin/products/new">
            <Icon.plus /> New product
          </ButtonLink>
        }
      />

      {newRequests > 0 ? (
        <Link
          href="/admin/requests?status=NEW"
          className="mb-6 flex items-center justify-between gap-4 rounded-card border border-accent/30 bg-accent/[0.07] px-5 py-4 transition-colors hover:bg-accent/[0.12]"
        >
          <span className="text-sm">
            <Num className="text-lg text-accent mr-2">{newRequests}</Num>
            new sourcing {newRequests === 1 ? "request" : "requests"} awaiting review
          </span>
          <span className="text-[13px] font-medium text-accent whitespace-nowrap">Review →</span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} delta={s.delta}>
            {s.spark ? <Sparkline values={s.spark} /> : null}
          </StatCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 lg:gap-6 mt-8">
        <div>
          <SectionTitle
            action={
              <Link href="/admin/orders" className="text-[13px] text-muted hover:text-ink transition-colors">
                All orders →
              </Link>
            }
          >
            Recent orders
          </SectionTitle>
          <TableWrap>
            <Table>
              <THead>
                <tr>
                  <Th>Order</Th><Th>Email</Th><Th>Status</Th><Th align="right">Total</Th>
                </tr>
              </THead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <Td colSpan={4}>
                      <EmptyState
                        title="No orders yet"
                        hint="Paid orders will appear here as they come in."
                      />
                    </Td>
                  </tr>
                ) : recent.map((o) => (
                  <Tr key={o.id}>
                    <Td>
                      <Link className="font-medium hover:text-accent transition-colors" href={`/admin/orders/${o.id}`}>
                        <Ident className="text-ink">{o.number}</Ident>
                      </Link>
                    </Td>
                    <Td className="text-muted">{o.email}</Td>
                    <Td><StatusBadge value={o.status} /></Td>
                    <Td align="right" numeric className="font-medium">{money(o.totalCents)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </div>

        <div>
          <SectionTitle>Top products · last 30 days</SectionTitle>
          <TableWrap>
            <Table>
              <THead>
                <tr><Th>Product</Th><Th align="right">Units</Th></tr>
              </THead>
              <tbody>
                {top.length === 0 ? (
                  <tr>
                    <Td colSpan={2}>
                      <EmptyState
                        title="No sales yet"
                        hint="Your best sellers over the last 30 days will rank here."
                      />
                    </Td>
                  </tr>
                ) : top.map((t, i) => (
                  <Tr key={i}>
                    <Td>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium">{t.brandName}</div>
                      <div className="mt-0.5">{t.productName}</div>
                    </Td>
                    <Td align="right"><Num className="text-lg">{t._sum.quantity}</Num></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </div>
      </div>
    </div>
  );
}

