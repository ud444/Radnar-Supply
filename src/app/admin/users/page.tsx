import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

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
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Users</h1>
      <div className="mt-6 bg-white border border-line rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-soft text-muted">
            <tr>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-right px-4 py-2">Orders</th>
              <th className="text-right px-4 py-2">Spent</th>
              <th className="text-right px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const spent = u.orders.filter((o) => o.paymentStatus === "PAID").reduce((a, o) => a + o.totalCents, 0);
              return (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-muted">{u.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${u.role === "ADMIN" ? "bg-ink text-white" : "bg-soft text-muted"}`}>{u.role.toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-2 text-right">{u.orders.length}</td>
                  <td className="px-4 py-2 text-right">{money(spent)}</td>
                  <td className="px-4 py-2 text-right">
                    {u.id !== me.id && (
                      <form action={setRole.bind(null, u.id, u.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}>
                        <button className="text-xs underline">Make {u.role === "ADMIN" ? "customer" : "admin"}</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No users yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="mt-5 flex items-center justify-between text-sm">
          <div className="text-ink/55">{total} users · page {page} of {pages}</div>
          <div className="flex gap-2">
            {page > 1 ? <Link href={`/admin/users?page=${page - 1}`} className="border border-ink/20 px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase font-bold hover:border-ink rounded-lg">← Prev</Link> : null}
            {page < pages ? <Link href={`/admin/users?page=${page + 1}`} className="border border-ink/20 px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase font-bold hover:border-ink rounded-lg">Next →</Link> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
