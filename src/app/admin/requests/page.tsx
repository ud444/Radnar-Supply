import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requireAdmin();
  const { status, type } = await searchParams;

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(type ? { type: type as any } : {}),
  };

  const [requests, newCount] = await Promise.all([
    db.sourcingRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    db.sourcingRequest.count({ where: { status: "NEW" } }),
  ]);

  const filters = [
    { label: "All", href: "/admin/requests" },
    { label: "New", href: "/admin/requests?status=NEW" },
    { label: "In progress", href: "/admin/requests?status=IN_PROGRESS" },
    { label: "Sourced", href: "/admin/requests?status=SOURCED" },
    { label: "Private", href: "/admin/requests?type=PRIVATE" },
  ];

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Personal Shopping</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Requests</h1>
        </div>
        {newCount > 0 ? (
          <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-accent">{newCount} new</div>
        ) : null}
      </div>

      <div className="flex gap-2 mt-6 flex-wrap">
        {filters.map((f) => (
          <Link key={f.label} href={f.href}
            className="text-[11px] tracking-[0.16em] uppercase font-bold border border-ink/20 px-3 py-1.5 hover:border-ink hover:bg-cream">
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-bone border border-ink/15 overflow-hidden mt-5">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Received</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Name</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Item</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Type</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink/55">No requests yet.</td></tr>
            ) : requests.map((r) => (
              <tr key={r.id} className="border-t border-ink/10 hover:bg-cream/50">
                <td className="px-4 py-3 text-ink/65 whitespace-nowrap">{r.createdAt.toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/requests/${r.id}`} className="hover:text-accent font-medium">{r.name}</Link>
                  <div className="text-[11px] text-ink/55">{r.email}</div>
                </td>
                <td className="px-4 py-3 max-w-xs"><div className="line-clamp-1">{r.item}</div></td>
                <td className="px-4 py-3">
                  {r.type === "PRIVATE"
                    ? <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-accent">Private</span>
                    : <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-ink/55">Standard</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
