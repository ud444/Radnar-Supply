import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AccountHome() {
  const user = await requireUser();

  const [recent, stats, defaultAddress] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.order.aggregate({
      where: { userId: user.id, paymentStatus: "PAID" },
      _count: true, _sum: { totalCents: true },
    }),
    db.address.findFirst({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { id: "desc" }] }),
  ]);

  const memberSince = user.createdAt.toLocaleString("en-GB", { month: "short", year: "numeric" });

  return (
    <div>
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="eyebrow-lead">Account · Dashboard</div>
          <h1 className="mt-2 font-display font-black text-5xl md:text-6xl uppercase display-tight">
            Hello{user.name ? `, ${user.name.split(" ")[0]}.` : "."}
          </h1>
        </div>
        <Link href="/shop" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent self-start md:self-end">
          Keep shopping →
        </Link>
      </div>

      {/* Stat row */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { l: "Orders",      v: stats._count },
          { l: "Total Spent", v: money(stats._sum.totalCents ?? 0) },
          { l: "Member",      v: memberSince },
        ].map((s) => (
          <div key={s.l} className="card-frame">
            <div className="eyebrow-lead">{s.l}</div>
            <div className="mt-3 font-display font-black text-2xl md:text-4xl tracking-tightest">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid sm:grid-cols-3 gap-3">
        {[
          { href: "/account/orders",    label: "Track an order",    sub: "View status, tracking & receipts" },
          { href: "/account/addresses", label: "Manage addresses",  sub: "Add or remove delivery addresses" },
          { href: "/account/security",  label: "Update password",   sub: "Change credentials, sign out devices" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="card group hover:bg-ink hover:text-paper transition-colors">
            <div className="font-display font-black uppercase text-lg tracking-tight">{q.label}</div>
            <div className="text-[12px] mt-1 text-ink/65 group-hover:text-paper/65">{q.sub}</div>
            <div className="mt-4 text-[10px] tracking-[0.22em] uppercase font-bold opacity-70 group-hover:text-accent">Open →</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-3">
          <div className="eyebrow-lead">Recent Orders</div>
          <Link href="/account/orders" className="text-[10px] tracking-[0.22em] uppercase font-bold hover:text-accent">All orders →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="card-frame text-center py-10">
            <div className="font-display font-black uppercase text-2xl tracking-tight">No orders yet.</div>
            <p className="text-sm text-ink/65 mt-2">Once you place an order it'll show up here.</p>
            <Link href="/shop" className="btn mt-5 inline-flex">Start shopping →</Link>
          </div>
        ) : (
          <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="py-5 grid grid-cols-12 gap-3 items-center hover:bg-cream/40 transition-colors px-3 -mx-3">
                  <div className="col-span-4">
                    <div className="num-mark">·</div>
                    <div className="font-mono text-sm">{o.number}</div>
                  </div>
                  <div className="col-span-3 text-[11px] tracking-[0.18em] uppercase font-bold text-ink/60">{o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  <div className="col-span-3"><StatusPill value={o.status} /></div>
                  <div className="col-span-2 text-right font-display font-black text-lg">{money(o.totalCents)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {defaultAddress && (
        <div className="mt-12">
          <div className="eyebrow-lead mb-3">Default Shipping</div>
          <div className="card-frame max-w-md">
            <div className="font-display font-bold uppercase tracking-tight">{defaultAddress.name}</div>
            <div className="text-sm text-ink/70 mt-1.5">
              {defaultAddress.line1}{defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}<br/>
              {defaultAddress.city}, {defaultAddress.postcode}<br/>
              {defaultAddress.country}
            </div>
            <Link href="/account/addresses" className="mt-4 inline-block text-[11px] tracking-[0.18em] uppercase font-bold underline hover:text-accent">Edit addresses</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    PAID:      "bg-accent text-paper",
    SHIPPED:   "bg-ink text-paper",
    DELIVERED: "bg-paper text-ink border-2 border-ink",
    PENDING:   "bg-cream text-ink border-2 border-ink/20",
    CANCELLED: "bg-red-100 text-red-800 border border-red-300",
  };
  return (
    <span className={`inline-block text-[10px] tracking-[0.18em] uppercase font-bold px-2.5 py-1 ${styles[value] ?? styles.PENDING}`}>
      {value.toLowerCase()}
    </span>
  );
}
