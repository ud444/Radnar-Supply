import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import Link from "next/link";

export default async function AccountHome() {
  const user = await requireUser();
  const recent = await db.order.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5,
  });
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Hello{user.name ? `, ${user.name}` : ""}.</h1>
      <p className="text-sm text-muted mt-1">{user.email}</p>

      <div className="mt-10">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-sm font-medium">Recent orders</h2>
          <Link href="/account/orders" className="text-xs underline text-muted">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="border border-line rounded p-8 text-sm text-muted text-center">No orders yet. <Link href="/shop" className="underline text-ink">Start shopping</Link>.</div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((o) => (
              <li key={o.id} className="py-4 flex justify-between text-sm">
                <Link href={`/account/orders/${o.id}`} className="underline">{o.number}</Link>
                <span className="text-muted">{o.createdAt.toLocaleDateString("en-GB")}</span>
                <span className={`text-xs px-2 py-1 rounded ${o.status === "PAID" ? "bg-green-100 text-green-700" : o.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-soft text-muted"}`}>{o.status.toLowerCase()}</span>
                <span>{money(o.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
