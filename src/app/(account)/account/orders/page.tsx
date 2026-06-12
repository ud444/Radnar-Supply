import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function Orders() {
  const user = await requireUser();
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Orders</h1>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {orders.length === 0 && <li className="py-8 text-sm text-muted text-center">No orders yet.</li>}
        {orders.map((o) => (
          <li key={o.id} className="py-4 grid grid-cols-4 items-center text-sm">
            <Link href={`/account/orders/${o.id}`} className="underline">{o.number}</Link>
            <span className="text-muted">{o.createdAt.toLocaleDateString("en-GB")}</span>
            <span className={`text-xs justify-self-start px-2 py-1 rounded ${o.status === "PAID" ? "bg-green-100 text-green-700" : "bg-soft text-muted"}`}>{o.status.toLowerCase()}</span>
            <span className="text-right">{money(o.totalCents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
