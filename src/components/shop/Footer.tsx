import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop?category=clothing">Clothing</Link></li>
            <li><Link href="/shop?category=shoes">Shoes</Link></li>
            <li><Link href="/shop?category=accessories">Accessories</Link></li>
            <li><Link href="/shop?category=fragrance">Fragrance</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">Help</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/account">Account</Link></li>
            <li><a href="mailto:hello@radnar.supply">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/policies/shipping">Shipping</Link></li>
            <li><Link href="/policies/returns">Returns</Link></li>
            <li><Link href="/policies/privacy">Privacy</Link></li>
            <li><Link href="/policies/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/55 mb-3">Newsletter</div>
          <p className="text-sm text-white/65 mb-3">10% off your first order. New drops every Friday.</p>
          <form className="flex gap-2">
            <input type="email" placeholder="Email" className="flex-1 bg-white/10 border border-white/15 rounded px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none" />
            <button className="bg-white text-ink rounded px-4 py-2 text-sm font-medium">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 text-[11px] tracking-[0.06em] text-white/45 flex flex-col md:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Radnar Supply · Birmingham, UK</div>
          <div>Visa · Mastercard · Apple Pay · Google Pay · PayPal · Klarna</div>
        </div>
      </div>
    </footer>
  );
}
