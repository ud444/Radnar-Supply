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
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tightest">Checkout</h1>
        <p className="text-sm text-muted mt-2">You'll choose payment method (card, Apple Pay, PayPal, Klarna) on the next screen.</p>
        <CheckoutForm defaultEmail={session?.user.email ?? ""} defaultName={session?.user.name ?? ""} />
      </div>

      <aside className="border border-line rounded p-6 h-fit">
        <div className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">Your order</div>
        <ul className="divide-y divide-line">
          {cart.lines.map((l: any) => (
            <li key={l.variantId} className="py-3 flex gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.imageUrl} alt="" className="w-14 h-16 object-cover rounded bg-soft" />
              <div className="flex-1">
                <div className="text-[11px] tracking-[0.16em] uppercase text-muted">{l.brandName}</div>
                <div>{l.productName}</div>
                <div className="text-xs text-muted">Size {l.size} · qty {l.qty}</div>
              </div>
              <div>{money(l.lineCents)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
          <div className="flex justify-between font-medium pt-2 border-t border-line mt-2"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <Link href="/cart" className="mt-4 inline-block text-xs underline text-muted">Edit bag</Link>
      </aside>
    </div>
  );
}
