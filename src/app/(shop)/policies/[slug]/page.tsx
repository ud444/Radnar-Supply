import { notFound } from "next/navigation";
import Link from "next/link";

const COMPANY = {
  name: "Radnar Supply Ltd",
  number: "17263761",
  city: "Birmingham, United Kingdom",
  email: "hello@radnar.supply",
};

type Section = { h: string; body: string };
type Policy = { title: string; eyebrow: string; intro: string; sections: Section[]; updated: string };

const PAGES: Record<string, Policy> = {
  shipping: {
    eyebrow: "Policy",
    title: "Shipping",
    intro: "We ship daily Monday–Friday from our Birmingham warehouse. Orders placed before 2pm UK time go out the same working day.",
    updated: "12 June 2026",
    sections: [
      { h: "Where we ship", body: "United Kingdom only at this time. EU and US shipping coming soon — sign up to the newsletter to be notified." },
      { h: "Delivery options & cost", body: "Standard tracked delivery: £4.95 (free on orders over £75) — 2–4 working days via Royal Mail or DPD. Express tracked: surcharge calculated at checkout — next working day for orders placed before 2pm." },
      { h: "Tracking", body: "You'll receive a dispatch confirmation by email with your tracking link as soon as your order is collected by the carrier. If it hasn't arrived after 5 working days, reply to that email and we'll chase the carrier on your behalf." },
      { h: "Address accuracy", body: "We can only ship to the address provided at checkout. If you spot an error within 30 minutes of ordering, email " + COMPANY.email + " — we may be able to amend before dispatch. Once shipped, we can't change the destination." },
      { h: "Customs (international, when available)", body: "International customers are responsible for any duties, taxes, or customs charges levied by the destination country." },
    ],
  },
  returns: {
    eyebrow: "Policy",
    title: "Returns",
    intro: "30 days to return any unworn item in original condition with tags attached. UK returns are free.",
    updated: "12 June 2026",
    sections: [
      { h: "Eligibility", body: "Items must be unworn, undamaged, with all original tags, packaging, and protective packaging (e.g. dust bags, boxes) attached. Footwear must be returned in the original branded box — taped, not labelled directly. Fragrance is final sale once the seal is broken." },
      { h: "How to return", body: "Reply to your order confirmation email with your order number and the reason for return. We'll send you a free pre-paid return label by email within one working day. Drop the package at any Royal Mail or DPD point." },
      { h: "Refund timing", body: "Refunds are processed within 3 working days of the item arriving back with us. The refund will land in your original payment method within a further 3–5 working days depending on your bank." },
      { h: "Exchanges", body: "We don't run a direct exchange flow. To exchange for a different size, simply return the original item and place a new order. The new order will be prioritised for dispatch." },
      { h: "Faulty or incorrect items", body: "If the item arrives damaged, faulty, or doesn't match the listing, email " + COMPANY.email + " within 7 days of delivery with photos. We'll arrange a free return and a replacement or full refund — whichever you prefer. This doesn't affect your statutory rights under the UK Consumer Rights Act 2015." },
    ],
  },
  privacy: {
    eyebrow: "Policy",
    title: "Privacy",
    intro: COMPANY.name + " (\"we\", \"us\", \"our\") is the data controller for the personal information you provide via radnar.supply. We process your data under UK GDPR and the Data Protection Act 2018.",
    updated: "12 June 2026",
    sections: [
      { h: "What we collect", body: "Account: name, email, password (hashed). Orders: shipping address, phone (optional), order history. Payments: handled by Mollie — we never see card details. Marketing: email for newsletter only if you opt in. Technical: IP address, browser, pages viewed (for security and analytics)." },
      { h: "Why we collect it", body: "To fulfil and ship your orders, to provide your account and order history, to send transactional emails (order confirmations, shipping updates, password reset), to comply with legal obligations (e.g. tax records), and — only if you opt in — to send marketing." },
      { h: "Who we share it with", body: "Mollie (payment processing), Resend (transactional and marketing email), UploadThing (image hosting), Royal Mail / DPD (delivery). Each is a processor bound by contract. We do not sell personal data." },
      { h: "How long we keep it", body: "Order and account data: 7 years after your last interaction, for tax-record compliance. Marketing subscribers: until you unsubscribe. Logs: 30 days." },
      { h: "Your rights", body: "Under UK GDPR you have the right to access, correct, erase, restrict, port, or object to processing of your data. Email " + COMPANY.email + " with the subject \"Data request\" and we'll respond within 30 days." },
      { h: "Cookies", body: "We use a small number of strictly-necessary cookies (cart, session) and — only if you accept — analytics cookies (Google Analytics 4). You can change cookie preferences at any time via the cookie banner." },
      { h: "Contact", body: COMPANY.name + ", Birmingham, United Kingdom. Email: " + COMPANY.email + ". Company No. " + COMPANY.number + "." },
    ],
  },
  terms: {
    eyebrow: "Policy",
    title: "Terms of Sale",
    intro: "By placing an order on radnar.supply you agree to these terms, which form the contract between you and " + COMPANY.name + ". They do not affect your statutory rights as a consumer.",
    updated: "12 June 2026",
    sections: [
      { h: "Who we are", body: COMPANY.name + " (Company No. " + COMPANY.number + ") is a company registered in England and Wales, trading as Radnar Supply, registered office in Birmingham, United Kingdom." },
      { h: "Product authenticity", body: "Every product we sell is verified in-house against the brand's references before listing. If a product you receive is, in our or the brand's reasonable assessment, not authentic, you are entitled to a full refund — no questions." },
      { h: "Prices and currency", body: "Prices are shown in GBP (£) and include VAT where applicable. Shipping is calculated at checkout. We reserve the right to correct pricing errors before processing the order — if a correction would affect your order, we will contact you before charging." },
      { h: "Order acceptance", body: "Your order is an offer to buy. We accept the offer when we charge your payment method and dispatch the goods. Until dispatch, we may refuse or cancel an order — for example, if the item becomes out of stock, if we detect fraud, or for any other reasonable cause. In that case, you'll receive a full refund within 5 working days." },
      { h: "14-day cancellation right (Consumer Contracts Regulations)", body: "Under the Consumer Contracts Regulations 2013 you may cancel for any reason within 14 days of delivery. To exercise, email " + COMPANY.email + " with your order number. Items must be returned within a further 14 days. We will refund within 14 days of receiving the item back, including standard shipping you paid (but not any premium upgrade)." },
      { h: "30-day returns (goodwill)", body: "Separately to the statutory right above, we offer 30-day no-quibble returns on unworn items with original tags. See our Returns policy for details." },
      { h: "Liability", body: "Our liability to you for any loss arising from a contract for sale is limited to the price you paid for the product. We do not limit liability for death, personal injury, or fraud — or anything else where the law forbids limitation." },
      { h: "Disputes & governing law", body: "These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales. UK consumers retain the right to bring proceedings in their local courts." },
    ],
  },
};

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="text-[11px] tracking-[0.22em] uppercase text-ink/55 font-bold">{page.eyebrow}</div>
      <h1 className="mt-2 font-display font-black text-5xl md:text-7xl uppercase display-tight">{page.title}</h1>
      <p className="mt-6 text-[16px] text-ink/80 leading-relaxed">{page.intro}</p>
      <div className="mt-3 text-[11px] tracking-[0.18em] uppercase font-bold text-ink/45">Last updated · {page.updated}</div>

      <div className="mt-12 space-y-10">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display font-bold uppercase text-xl md:text-2xl tracking-tight">{s.h}</h2>
            <p className="mt-3 text-[15px] text-ink/85 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-ink/15 text-sm text-ink/60">
        {COMPANY.name} · Company No. <span className="font-mono">{COMPANY.number}</span> · {COMPANY.city} · <Link href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {Object.keys(PAGES).filter((s) => s !== slug).map((s) => (
          <Link key={s} href={`/policies/${s}`} className="border-2 border-ink/30 hover:border-ink px-4 py-2 text-[11px] tracking-[0.22em] uppercase font-bold">{PAGES[s].title}</Link>
        ))}
      </div>
    </div>
  );
}
