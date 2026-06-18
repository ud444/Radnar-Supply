import Link from "next/link";
import Image from "next/image";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-ink text-paper mt-32">
      <div className="border-b border-paper/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <Image src="/radnar-mark-light.png" alt="Radnar Supply" width={1600} height={593} className="h-24 md:h-32 w-auto" />
            <p className="mt-6 text-paper/70 text-sm max-w-md leading-relaxed">
              Source. Supply. Personal shop. Premium fashion and luxury goods — in stock, or sourced for you through our supplier network. A UK business, shipping daily.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rule-eyebrow text-paper/80">Get on the list</div>
            <p className="mt-3 text-paper/70 text-sm">First access to new stock and sourcing drops.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 text-sm">
        {[
          { h: "Radnar Select", items: [["Personal Shopping","/sourcing"],["Sourcing Requests","/sourcing"],["Radnar Private","/sourcing?type=private"],["Our Story","/about"]] },
          { h: "Shop",   items: [["Clothing","/shop?category=clothing"],["Shoes","/shop?category=shoes"],["Accessories","/shop?category=accessories"],["Fragrance","/shop?category=fragrance"],["Brand Roster","/brands"]] },
          { h: "Help",   items: [["The Journal","/blog"],["Contact","mailto:hello@radnarsupply.com"],["FAQ","/policies/shipping"],["Track Order","/account/orders"]] },
          { h: "Legal",  items: [["Shipping","/policies/shipping"],["Returns","/policies/returns"],["Privacy","/policies/privacy"],["Terms","/policies/terms"]] },
          { h: "Social", items: [["Instagram","https://instagram.com"],["TikTok","https://tiktok.com"],["X / Twitter","https://x.com"]] },
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
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6 text-[10.5px] tracking-[0.16em] text-paper/55 flex flex-col md:flex-row justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Radnar Supply Ltd · Company No. 17263761 · Birmingham, UK
          </div>
          <div className="uppercase tracking-[0.18em]">Visa · Mastercard · Apple Pay · Google Pay · PayPal · Klarna</div>
        </div>
      </div>
    </footer>
  );
}
