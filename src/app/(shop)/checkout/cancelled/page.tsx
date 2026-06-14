import Link from "next/link";
import { getCart } from "@/lib/cart";
import { money } from "@/lib/format";

export default async function Cancelled() {
  const cart = await getCart();
  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16">
      <section className="border-2 border-ink p-6 md:p-12">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="num-mark">·</div>
            <div className="eyebrow-lead mt-2">Payment Cancelled</div>
            <h1 className="mt-4 font-display font-black text-6xl md:text-[8rem] uppercase display-tight">
              No charge<br/>
              <span className="text-accent">taken.</span>
            </h1>
            <p className="mt-6 max-w-md text-ink/80 leading-relaxed">
              Your bag's still here. Whether you changed your mind or the payment didn't go through — nothing was charged to your card.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/checkout" className="btn">Try again →</Link>
              <Link href="/cart" className="btn-ghost btn">Back to bag</Link>
            </div>
          </div>

          {cart.lines.length > 0 ? (
            <aside className="md:col-span-5">
              <div className="card-frame">
                <div className="eyebrow-lead">Your Bag · {cart.count} item{cart.count !== 1 ? "s" : ""}</div>
                <ul className="mt-5 divide-y divide-ink/10 max-h-72 overflow-y-auto">
                  {cart.lines.map((l: any) => (
                    <li key={l.variantId} className="py-3 flex gap-3 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.imageUrl} alt="" className="w-12 h-16 object-cover bg-cream shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55">{l.brandName}</div>
                        <div className="line-clamp-1">{l.productName}</div>
                        <div className="text-[11px] text-ink/55">Size {l.size} · qty {l.qty}</div>
                      </div>
                      <div className="font-medium whitespace-nowrap">{money(l.lineCents)}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t-2 border-ink flex items-baseline justify-between">
                  <div className="eyebrow-lead">Subtotal</div>
                  <div className="font-display font-black text-3xl tracking-tightest">{money(cart.subtotalCents)}</div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <div className="eyebrow-lead">Common Reasons</div>
        <h2 className="mt-2 font-display font-black text-4xl md:text-5xl uppercase display-tight">Why payment fails.</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-0 border border-ink">
          {[
            { n: "01", h: "Card declined", p: "Check the number, expiry, and security code. Some banks decline online payments by default — your bank app can fix that in seconds." },
            { n: "02", h: "Wrong details", p: "Make sure the billing address you entered matches what your card issuer has on file." },
            { n: "03", h: "Try another method", p: "Apple Pay, Google Pay, PayPal, or Klarna interest-free are all available at the next checkout step." },
          ].map((s, i) => (
            <div key={s.n} className={`p-7 md:p-8 ${i < 2 ? "md:border-r" : ""} border-ink`}>
              <div className="font-display font-black text-5xl text-accent">{s.n}</div>
              <div className="font-display font-black text-2xl uppercase mt-4 tracking-tight">{s.h}</div>
              <p className="text-sm text-ink/75 mt-2 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 card-frame text-center">
        <div className="eyebrow-lead">Still Stuck?</div>
        <div className="font-display font-black uppercase text-2xl tracking-tight mt-2">We'll help in minutes.</div>
        <p className="text-sm text-ink/65 mt-2 max-w-md mx-auto">
          Email us at <a href="mailto:hello@radnarsupply.com" className="underline hover:text-accent">hello@radnarsupply.com</a> with your bag screenshot — we'll get you sorted.
        </p>
      </section>
    </div>
  );
}
