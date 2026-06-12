import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-ink text-paper mt-32">
      <div className="border-b border-paper/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <Image src="/radnar-mark-light.png" alt="Radnar Supply" width={1600} height={593} className="h-24 md:h-32 w-auto" />
            <p className="mt-6 text-paper/70 text-sm max-w-md leading-relaxed">
              Hand-picked designer pieces. Authenticated in-house. Always priced below retail. Out of Birmingham, UK — shipping daily.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rule-eyebrow text-paper/80">Get on the list</div>
            <p className="mt-3 text-paper/70 text-sm">10% off your first order. New drops every Friday.</p>
            <form className="mt-4 flex">
              <input type="email" placeholder="Your email" className="flex-1 bg-paper text-ink px-4 py-3 text-sm placeholder:text-ink/50 focus:outline-none" />
              <button className="bg-accent text-paper px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-paper hover:text-ink transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        {[
          { h: "Shop",    items: [["Clothing","/shop?category=clothing"],["Shoes","/shop?category=shoes"],["Accessories","/shop?category=accessories"],["Fragrance","/shop?category=fragrance"]] },
          { h: "Help",    items: [["About","/about"],["Contact","mailto:hello@radnar.supply"],["FAQ","/policies/shipping"],["Track Order","/account/orders"]] },
          { h: "Legal",   items: [["Shipping","/policies/shipping"],["Returns","/policies/returns"],["Privacy","/policies/privacy"],["Terms","/policies/terms"]] },
          { h: "Social",  items: [["Instagram","https://instagram.com"],["TikTok","https://tiktok.com"],["X / Twitter","https://x.com"]] },
        ].map((col) => (
          <div key={col.h}>
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55 mb-4">{col.h}</div>
            <ul className="space-y-2.5">
              {col.items.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-paper/85 hover:text-accent">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-paper/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-5 text-[10px] tracking-[0.18em] uppercase text-paper/45 flex flex-col md:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Radnar Supply · Birmingham, UK</div>
          <div>Visa · Mastercard · Apple Pay · Google Pay · PayPal · Klarna</div>
        </div>
      </div>
    </footer>
  );
}
