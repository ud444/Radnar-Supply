import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function Orders() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { take: 3 } },
  });

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow-lead">Account · Orders</div>
          <h1 className="mt-2 font-display font-black text-4xl md:text-6xl uppercase display-tight">Orders.</h1>
        </div>
        <Link href="/shop" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">
          Keep shopping →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card-frame mt-10 text-center py-16">
          <div className="font-display font-black uppercase text-3xl tracking-tight">No orders yet.</div>
          <p className="text-sm text-ink/65 mt-3">Place your first order and it'll appear here with full history, tracking, and returns.</p>
          <Link href="/shop" className="btn mt-6 inline-flex">Start shopping →</Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => {
            const itemCount = o.items.reduce((a, i) => a + i.quantity, 0);
            return (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="block card hover:border-ink transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="num-mark">·</div>
                      <div className="font-mono font-bold text-lg">{o.number}</div>
                      <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 mt-1">
                        {o.createdAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusPill value={o.status} />
                      <div className="font-display font-black text-2xl tracking-tightest mt-2">{money(o.totalCents)}</div>
                    </div>
                  </div>

                  {/* Image preview */}
                  <div className="mt-4 flex items-center gap-2">
                    {o.items.slice(0, 3).map((i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img key={i.id} src={i.imageUrl} alt="" className="w-14 h-16 object-cover bg-cream" />
                    ))}
                    <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/60 ml-2">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </div>
                    <div className="ml-auto text-[11px] tracking-[0.18em] uppercase font-bold text-ink/65 hover:text-accent">View order →</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
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
