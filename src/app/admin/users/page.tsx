import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AdminUsers() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" }, include: { orders: true },
  });

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
    </div>
  );
}
