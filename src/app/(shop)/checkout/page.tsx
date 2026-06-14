import { redirect } from "next/navigation";
import Link from "next/link";
import { getCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { getSession } from "@/lib/session";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const [cart, flat, freeAbove, session] = await Promise.all([
    getCart(),
    getSetting<number>("shipping.flat_rate_pence", 495),
    getSetting<number>("shipping.free_threshold_pence", 7500),
    getSession(),
  ]);
  if (cart.lines.length === 0) redirect("/cart");

  const shipping = cart.subtotalCents >= freeAbove ? 0 : flat;
  const total = cart.subtotalCents + shipping;

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow-lead">Checkout</div>
          <h1 className="mt-2 font-display font-black text-5xl md:text-7xl uppercase display-tight">Almost yours.</h1>
        </div>
        <Link href="/cart" className="text-[11px] tracking-[0.22em] uppercase font-bold border-b-2 border-ink hover:text-accent hover:border-accent">
          ← Back to bag
        </Link>
      </div>

      {/* Step indicator */}
      <ol className="mt-10 grid grid-cols-3 gap-0 border border-ink">
        {[
          { n: "01", h: "Shipping" },
          { n: "02", h: "Payment" },
          { n: "03", h: "Confirmed" },
        ].map((s, i) => (
          <li key={s.n} className={`p-4 md:p-5 ${i === 0 ? "bg-ink text-paper" : "bg-paper text-ink"} ${i < 2 ? "border-r border-ink" : ""}`}>
            <div className={`num-mark ${i === 0 ? "text-accent" : "text-ink/30"}`}>{s.n}</div>
            <div className="font-display font-black uppercase text-base md:text-lg tracking-tight mt-1">{s.h}</div>
          </li>
        ))}
      </ol>

      {/* Main grid */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-12 mt-10">
        <section className="md:col-span-7 lg:col-span-8">
          <div className="eyebrow-lead">Contact & Shipping</div>
          <h2 className="mt-2 font-display font-black text-3xl md:text-4xl uppercase display-tight">Where it's going.</h2>
          <CheckoutForm defaultEmail={session?.user.email ?? ""} defaultName={session?.user.name ?? ""} />

          {/* Express options hint */}
          <div className="mt-10 p-5 border-2 border-dashed border-ink/30 bg-cream/40">
            <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/70">Faster way</div>
            <div className="mt-2 font-display font-bold uppercase text-lg tracking-tight">Express payment options at next step</div>
            <p className="text-sm text-ink/65 mt-2">Pay in seconds with Apple Pay, Google Pay, or PayPal once you reach the Mollie checkout. Pay later with Klarna interest-free.</p>
          </div>
        </section>

        {/* Order summary — sticky */}
        <aside className="md:col-span-5 lg:col-span-4">
          <div className="md:sticky md:top-28">
            <div className="card-frame">
              <div className="flex items-center justify-between">
                <div className="eyebrow-lead">Your Order</div>
                <Link href="/cart" className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">Edit</Link>
              </div>

              <ul className="mt-5 divide-y divide-ink/10">
                {cart.lines.map((l: any) => (
                  <li key={l.variantId} className="py-3 flex gap-3 text-sm">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.imageUrl} alt="" className="w-16 h-20 object-cover bg-cream" />
                      <span className="absolute -top-1.5 -right-1.5 bg-ink text-paper text-[10px] font-bold w-5 h-5 grid place-items-center">{l.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-ink/55">{l.brandName}</div>
                      <div className="line-clamp-1">{l.productName}</div>
                      <div className="text-[11px] text-ink/55 mt-0.5">Size {l.size}</div>
                    </div>
                    <div className="font-medium whitespace-nowrap">{money(l.lineCents)}</div>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink/70">Subtotal</dt><dd>{money(cart.subtotalCents)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/70">Delivery</dt><dd>{shipping === 0 ? <span className="text-accent font-bold">Free</span> : money(shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/70">VAT</dt><dd>Included</dd></div>
              </dl>

              <div className="mt-5 pt-4 border-t-2 border-ink flex items-baseline justify-between">
                <div className="eyebrow-lead">Total</div>
                <div className="font-display font-black text-4xl tracking-tightest">{money(total)}</div>
              </div>
              <div className="text-[11px] text-ink/55 text-right mt-1">or 3 interest-free payments with Klarna</div>
            </div>

            {/* Reassurance */}
            <ul className="mt-5 space-y-2.5 text-[12px] tracking-[0.04em]">
              {[
                "Secure payment via Mollie · PCI-DSS",
                "30-day free UK returns",
                "Authenticated in-house",
              ].map((s) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-accent" />
                  <span className="uppercase font-semibold tracking-[0.06em] text-ink/80">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
