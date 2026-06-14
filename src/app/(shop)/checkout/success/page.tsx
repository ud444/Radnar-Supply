import Link from "next/link";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function Success({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const { o } = await searchParams;
  const order = o ? await db.order.findUnique({ where: { number: o }, include: { items: true } }) : null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Hero */}
      <section className="border-2 border-ink p-6 md:p-12">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="num-mark">·</div>
            <div className="eyebrow-lead mt-2 text-accent">Order Confirmed</div>
            <h1 className="mt-4 font-display font-black text-6xl md:text-[8rem] uppercase display-tight">
              Thank<br/>you.
            </h1>
            {order ? (
              <div className="mt-6 text-[12px] tracking-[0.22em] uppercase font-bold text-ink/70">
                Order · <span className="font-mono text-ink">{order.number}</span>
              </div>
            ) : null}
            <p className="mt-6 max-w-md text-ink/80 leading-relaxed">
              {order ? (
                <>A confirmation has been emailed to <span className="font-medium text-ink">{order.email}</span>. We'll send another one the moment your order leaves Birmingham.</>
              ) : (
                <>A confirmation has landed in your inbox. We'll email again the moment your order ships from Birmingham.</>
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/account/orders" className="btn">Track this order →</Link>
              <Link href="/shop" className="btn-ghost btn">Continue shopping</Link>
            </div>
          </div>

          {order ? (
            <aside className="md:col-span-5">
              <div className="card-frame">
                <div className="eyebrow-lead">Order Summary</div>
                <ul className="mt-5 divide-y divide-ink/10 max-h-72 overflow-y-auto">
                  {order.items.map((i) => (
                    <li key={i.id} className="py-3 flex gap-3 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.imageUrl} alt="" className="w-12 h-16 object-cover bg-cream shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55">{i.brandName}</div>
                        <div className="line-clamp-1">{i.productName}</div>
                        <div className="text-[11px] text-ink/55">Size {i.size} · qty {i.quantity}</div>
                      </div>
                      <div className="font-medium whitespace-nowrap">{money(i.unitPriceCents * i.quantity)}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t-2 border-ink flex items-baseline justify-between">
                  <div className="eyebrow-lead">Total</div>
                  <div className="font-display font-black text-3xl tracking-tightest">{money(order.totalCents)}</div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* What happens next */}
      <section className="mt-16">
        <div className="eyebrow-lead">What Happens Next</div>
        <h2 className="mt-2 font-display font-black text-4xl md:text-5xl uppercase display-tight">
          Three steps. <span className="text-accent">No surprises.</span>
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-0 border border-ink">
          {[
            { n: "01", h: "Confirmation",  p: "Your order confirmation is in your inbox. Check spam if it isn't — and reply if anything looks off." },
            { n: "02", h: "Authenticated", p: "Your piece is hand-checked at our Birmingham warehouse before being carefully packed." },
            { n: "03", h: "Dispatched",    p: "Tracked dispatch within 1–2 working days. You'll get a shipping email with a live tracking link." },
          ].map((s, i) => (
            <div key={s.n} className={`p-7 md:p-8 ${i < 2 ? "md:border-r" : ""} border-ink`}>
              <div className="font-display font-black text-5xl text-accent">{s.n}</div>
              <div className="font-display font-black text-2xl uppercase mt-4 tracking-tight">{s.h}</div>
              <p className="text-sm text-ink/75 mt-2 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Help / referral */}
      <section className="mt-16 grid md:grid-cols-2 gap-4">
        <div className="card-frame">
          <div className="eyebrow-lead">Questions?</div>
          <div className="font-display font-black uppercase text-2xl tracking-tight mt-2">We're on it.</div>
          <p className="text-sm text-ink/70 mt-2 leading-relaxed">
            Reply directly to your order email or write to us at <a href="mailto:hello@radnarsupply.com" className="underline hover:text-accent">hello@radnarsupply.com</a>. We respond within one working day.
          </p>
        </div>
        <div className="card-frame bg-ink text-paper border-ink">
          <div className="eyebrow-lead text-paper">Tell A Friend</div>
          <div className="font-display font-black uppercase text-2xl tracking-tight mt-2">10% off for them.</div>
          <p className="text-sm text-paper/70 mt-2 leading-relaxed">
            Refer a friend and they get 10% off their first order. (Coming soon — link your account to participate when launched.)
          </p>
        </div>
      </section>
    </div>
  );
}
