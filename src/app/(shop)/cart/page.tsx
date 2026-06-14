import Link from "next/link";
import { getCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { db } from "@/lib/prisma";
import { CartLines } from "./CartLines";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function CartPage() {
  const [cart, freeAbove] = await Promise.all([
    getCart(),
    getSetting<number>("shipping.free_threshold_pence", 7500),
  ]);
  const remaining = Math.max(0, freeAbove - cart.subtotalCents);
  const progress = Math.min(100, (cart.subtotalCents / freeAbove) * 100);

  const recs = cart.lines.length
    ? await db.product.findMany({
        where: { active: true, slug: { notIn: cart.lines.map((l: any) => l.slug) } },
        orderBy: { featured: "desc" },
        take: 4,
        include: { brand: true, images: { take: 2, orderBy: { position: "asc" } } },
      })
    : [];

  if (cart.lines.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="eyebrow-lead">Bag · 0 Items</div>
        <h1 className="mt-3 font-display font-black text-6xl md:text-9xl uppercase display-tight">
          Bag's <span className="text-accent">empty.</span>
        </h1>
        <p className="mt-6 max-w-md text-ink/75">Verified designer, always below retail. Shipping daily from Birmingham.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-lg">Shop The Drop →</Link>
          <Link href="/shop?sort=newest" className="btn btn-ghost btn-lg">New In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow-lead">Bag · {cart.count} item{cart.count !== 1 ? "s" : ""}</div>
          <h1 className="mt-2 font-display font-black text-5xl md:text-7xl uppercase display-tight">Your bag.</h1>
        </div>
        <Link href="/shop" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent transition-colors">
          Continue shopping →
        </Link>
      </div>

      {/* Free shipping progress */}
      <div className="mt-8 border-t-2 border-b-2 border-ink py-4">
        <div className="flex justify-between items-center text-[11px] tracking-[0.18em] uppercase font-bold mb-2.5">
          <span>{remaining > 0 ? <>You're <span className="text-accent">{money(remaining)}</span> away from free UK delivery</> : <span className="text-accent">✦ You qualify for free UK delivery</span>}</span>
          <span className="text-ink/55">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-cream relative overflow-hidden">
          <div className="h-full bg-ink transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-12 gap-8 md:gap-12 mt-10">
        {/* Lines */}
        <section className="md:col-span-7 lg:col-span-8">
          <CartLines lines={cart.lines} />

          {/* Trust strip */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/15 pt-8">
            {[
              { h: "Verified Designer", p: "Authenticated in-house before dispatch." },
              { h: "Free UK Returns",   p: "30 days. Free pre-paid label by email." },
              { h: "Secure Checkout",   p: "Cards, Klarna, Apple Pay, PayPal via Mollie." },
            ].map((t) => (
              <div key={t.h}>
                <div className="num-mark mb-2">·</div>
                <div className="font-display font-bold uppercase text-sm tracking-tight">{t.h}</div>
                <div className="text-[12px] text-ink/65 mt-1 leading-relaxed">{t.p}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <aside className="md:col-span-5 lg:col-span-4">
          <div className="md:sticky md:top-28">
            <div className="card-frame">
              <div className="eyebrow-lead">Order Summary</div>

              <dl className="mt-6 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/70">Subtotal · {cart.count} item{cart.count !== 1 ? "s" : ""}</dt>
                  <dd>{money(cart.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/70">Delivery</dt>
                  <dd>{remaining > 0 ? "Calculated at checkout" : "Free"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/70">VAT</dt>
                  <dd>Included</dd>
                </div>
              </dl>

              <div className="mt-6 pt-5 border-t-2 border-ink flex items-baseline justify-between">
                <div className="eyebrow-lead">Total</div>
                <div className="font-display font-black text-4xl tracking-tightest">{money(cart.subtotalCents)}</div>
              </div>
              <div className="text-[11px] text-ink/55 text-right mt-1">or 3 interest-free payments with Klarna</div>

              <Link href="/checkout" className="btn btn-lg btn-block mt-6">
                Secure Checkout →
              </Link>

              {/* Promo code */}
              <details className="mt-4 group">
                <summary className="text-[11px] tracking-[0.18em] uppercase font-bold cursor-pointer hover:text-accent list-none flex justify-between items-center">
                  Got a discount code? <span className="text-ink/40 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-3 flex gap-2">
                  <input placeholder="CODE" className="flex-1 bg-bone border-2 border-ink/20 px-3 py-2.5 text-sm uppercase tracking-wider focus:outline-none focus:border-ink" />
                  <button className="btn">Apply</button>
                </div>
              </details>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2 items-center justify-items-center text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55">
              <span>Visa</span><span>MC</span><span>Amex</span><span>Klarna</span><span>PayPal</span><span>Apple</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Recommended */}
      {recs.length > 0 && (
        <section className="mt-24 border-t border-ink/15 pt-16">
          <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
            <div>
              <div className="eyebrow-lead">Complete The Look</div>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl uppercase display-tight">You might also like.</h2>
            </div>
            <Link href="/shop" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {recs.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
