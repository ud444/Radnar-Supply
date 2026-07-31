import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import {
  PageHeader, Button, TableWrap, Table, THead, Th, Tr, Td, EmptyState, Badge, Pagination,
} from "@/components/admin/ui";

const PER_PAGE = 25;

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { orders: { select: { totalCents: true, paymentStatus: true } } },
      take: PER_PAGE, skip: (page - 1) * PER_PAGE,
    }),
    db.user.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  async function setRole(id: string, role: "ADMIN" | "CUSTOMER") {
    "use server";
    const m = await requireAdmin();
    if (id === m.id) return;
    await db.user.update({ where: { id }, data: { role } });
    revalidatePath("/admin/users");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Store"
        title="Customers"
        description="Everyone who has registered an account, with what they have spent."
      />

      <TableWrap>
        <Table>
          <THead>
            <tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th align="right">Orders</Th>
              <Th align="right">Spent</Th>
              <Th align="right" />
            </tr>
          </THead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <Td colSpan={6}>
                  <EmptyState
                    title="No customers yet"
                    hint="Accounts appear here as people register on the storefront."
                  />
                </Td>
              </tr>
            ) : users.map((u) => {
              const spent = u.orders
                .filter((o) => o.paymentStatus === "PAID")
                .reduce((a, o) => a + o.totalCents, 0);
              return (
                <Tr key={u.id}>
                  <Td className="font-medium">{u.email}</Td>
                  <Td className="text-muted">{u.name ?? "—"}</Td>
                  <Td>
                    <Badge tone={u.role === "ADMIN" ? "info" : "neutral"} dot={false}>
                      {u.role === "ADMIN" ? "Admin" : "Customer"}
                    </Badge>
                  </Td>
                  <Td align="right" numeric>{u.orders.length}</Td>
                  <Td align="right" numeric className="font-medium">{money(spent)}</Td>
                  <Td align="right">
                    {u.id !== me.id && (
                      <form action={setRole.bind(null, u.id, u.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}>
                        <Button variant="ghost" size="sm">
                          Make {u.role === "ADMIN" ? "customer" : "admin"}
                        </Button>
                      </form>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      <Pagination
        page={page} pages={pages} total={total} noun="customers"
        hrefFor={(n) => (n > 1 ? `/admin/users?page=${n}` : "/admin/users")}
      />
    </div>
  );
}
