import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Card, Button, ButtonLink, SectionTitle, TableWrap, Table, THead, Th, Tr, Td,
  Badge, EmptyState, Ident, StatCard, btn,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: { orderBy: [{ isDefault: "desc" }, { id: "asc" }] },
    },
  });
  if (!user) notFound();

  // Sourcing requests are keyed by the address given on the form, not by user
  // id — a customer can enquire before ever registering, so match on email.
  const requests = await db.sourcingRequest.findMany({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const paid = user.orders.filter((o) => o.paymentStatus === "PAID");
  const spent = paid.reduce((a, o) => a + o.totalCents, 0);
  const refunded = user.orders.reduce((a, o) => a + o.refundedCents, 0);
  const items = paid.reduce((a, o) => a + o.items.reduce((b, i) => b + i.quantity, 0), 0);
  const avg = paid.length ? Math.round(spent / paid.length) : 0;
  const lastOrder = user.orders[0]?.createdAt ?? null;

  async function setRole(role: "ADMIN" | "CUSTOMER") {
    "use server";
    const m = await requireAdmin();
    if (id === m.id) return; // never let an admin demote themselves
    await db.user.update({ where: { id }, data: { role } });
    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/users");
  }

  return (
    <div className="max-w-5xl">
      <Link href="/admin/users" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All customers
      </Link>

      <div className="mt-3 pb-5 mb-6 border-b border-line flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.01em]">
              {user.name ?? user.email}
            </h1>
            <Badge tone={user.role === "ADMIN" ? "info" : "neutral"} dot={false}>
              {user.role === "ADMIN" ? "Admin" : "Customer"}
            </Badge>
          </div>
          <div className="text-sm text-muted mt-1.5">
            {user.email}
            {user.phone ? <> · {user.phone}</> : null}
            {" · "}joined {user.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ButtonLink href={`/admin/emails/new?to=${encodeURIComponent(user.email)}`} variant="secondary">
            Email customer
          </ButtonLink>
          <a href={`mailto:${user.email}`} className={btn("ghost")}>Open in mail app</a>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Lifetime spend" value={money(spent)} />
        <StatCard label="Paid orders" value={paid.length} />
        <StatCard label="Items bought" value={items} />
        <StatCard label="Average order" value={paid.length ? money(avg) : "—"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionTitle>Orders</SectionTitle>
            <TableWrap>
              <Table>
                <THead>
                  <tr>
                    <Th>Order</Th><Th>Date</Th><Th>Payment</Th><Th>Status</Th><Th align="right">Total</Th>
                  </tr>
                </THead>
                <tbody>
                  {user.orders.length === 0 ? (
                    <tr>
                      <Td colSpan={5}>
                        <EmptyState
                          title="No orders yet"
                          hint="This customer has an account but has not bought anything."
                        />
                      </Td>
                    </tr>
                  ) : user.orders.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent transition-colors">
                          <Ident className="text-ink">{o.number}</Ident>
                        </Link>
                        <div className="text-[12px] text-muted mt-0.5">
                          <span className="tabular-nums">{o.items.reduce((a, i) => a + i.quantity, 0)}</span> items
                        </div>
                      </Td>
                      <Td className="text-muted whitespace-nowrap">
                        {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </Td>
                      <Td><StatusBadge value={o.paymentStatus} /></Td>
                      <Td><StatusBadge value={o.status} /></Td>
                      <Td align="right" numeric className="font-medium">{money(o.totalCents)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </div>

          <div>
            <SectionTitle>Sourcing enquiries</SectionTitle>
            <TableWrap>
              <Table>
                <THead>
                  <tr><Th>Received</Th><Th>Item</Th><Th>Type</Th><Th>Status</Th></tr>
                </THead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <Td colSpan={4}>
                        <EmptyState
                          title="No enquiries"
                          hint="Nothing submitted through the sourcing form from this address."
                        />
                      </Td>
                    </tr>
                  ) : requests.map((r) => (
                    <Tr key={r.id}>
                      <Td className="text-muted whitespace-nowrap">
                        {r.createdAt.toLocaleDateString("en-GB")}
                      </Td>
                      <Td className="max-w-xs">
                        <Link href={`/admin/requests/${r.id}`} className="hover:text-accent transition-colors">
                          <span className="line-clamp-1">{r.item}</span>
                        </Link>
                      </Td>
                      <Td>
                        <Badge tone={r.type === "PRIVATE" ? "accent" : "neutral"} dot={false}>
                          {r.type === "PRIVATE" ? "Private" : "Standard"}
                        </Badge>
                      </Td>
                      <Td><StatusBadge value={r.status} /></Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </div>
        </div>

        <div className="space-y-6 h-fit">
          <div>
            <SectionTitle>Addresses</SectionTitle>
            <Card className="space-y-4">
              {user.addresses.length === 0 ? (
                <p className="text-[13px] text-muted">No saved addresses.</p>
              ) : user.addresses.map((a) => (
                <div key={a.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{a.name}</span>
                    {a.isDefault ? <Badge tone="success" dot={false}>Default</Badge> : null}
                  </div>
                  <div className="text-muted leading-relaxed">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                    {a.city}, {a.postcode}<br />
                    {a.country}
                    {a.phone ? <><br />{a.phone}</> : null}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <SectionTitle>Account</SectionTitle>
            <Card className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Customer since</span>
                <span>{user.createdAt.toLocaleDateString("en-GB")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Last order</span>
                <span>{lastOrder ? lastOrder.toLocaleDateString("en-GB") : "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Refunded</span>
                <span className="tabular-nums">{refunded > 0 ? money(refunded) : "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Password set</span>
                <span>{user.passwordHash ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">User ID</span>
                <Ident>{user.id}</Ident>
              </div>

              {user.id !== me.id ? (
                <form
                  action={setRole.bind(null, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}
                  className="pt-2 border-t border-line"
                >
                  <Button variant="secondary" size="sm" className="w-full">
                    Make {user.role === "ADMIN" ? "customer" : "admin"}
                  </Button>
                </form>
              ) : (
                <p className="pt-2 border-t border-line text-[12px] text-muted">
                  This is your own account, so its role cannot be changed here.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
