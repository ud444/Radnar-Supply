import Link from "next/link";
import { getCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { CartLines } from "./CartLines";

export default async function CartPage() {
  const [cart, freeAbove] = await Promise.all([
    getCart(),
    getSetting<number>("shipping.free_threshold_pence", 7500),
  ]);
  const remaining = Math.max(0, freeAbove - cart.subtotalCents);

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tightest">Your bag</h1>

      {cart.lines.length === 0 ? (
        <div className="mt-10 border border-line rounded p-12 text-center text-muted">
          Your bag is empty. <Link href="/shop" className="underline text-ink">Start shopping</Link>.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10 mt-8">
          <div className="md:col-span-2"><CartLines lines={cart.lines} /></div>
          <aside className="border border-line rounded p-6 h-fit">
            <div className="text-sm text-muted">
              {remaining > 0
                ? <>Spend <span className="text-ink font-medium">{money(remaining)}</span> more for free UK delivery.</>
                : <>You qualify for free UK delivery.</>}
            </div>
            <div className="mt-4 h-1 bg-line rounded overflow-hidden">
              <div className="h-full bg-ink transition-all duration-500" style={{ width: `${Math.min(100, (cart.subtotalCents / freeAbove) * 100)}%` }} />
            </div>
            <div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
            <div className="mt-1 flex justify-between text-sm text-muted"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="mt-4 pt-4 border-t border-line flex justify-between font-medium"><span>Total</span><span>{money(cart.subtotalCents)}</span></div>
            <Link href="/checkout" className="mt-6 block text-center bg-ink text-white py-3.5 rounded-full text-sm font-medium hover:bg-ink/85 transition-colors">Checkout</Link>
            <Link href="/shop" className="mt-3 block text-center text-sm underline text-ink">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
