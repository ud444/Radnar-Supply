import { getSetting } from "./settings";

/**
 * CMS-lite for static/info pages. Each page's content lives in a Setting row
 * ("page.<slug>") as JSON and falls back to the defaults below, so every page
 * renders fully before an admin edits anything — and edits go live immediately.
 */

export type PageSection = { h: string; body: string };
export type PageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: PageSection[];
  updated: string;
};

const COMPANY = {
  name: "Radnar Supply Ltd",
  number: "17263761",
  city: "Birmingham, United Kingdom",
  email: "hello@radnarsupply.com",
};

export const COMPANY_INFO = COMPANY;

// Slugs are exposed at /policies/<slug>. Order here drives the admin list + cross-links.
// (About Us has its own bespoke designed page and is edited separately.)
export const PAGE_SLUGS = ["shipping", "returns", "faq", "contact", "privacy", "terms"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

export const PAGE_LABELS: Record<PageSlug, string> = {
  shipping: "Shipping Policy",
  returns: "Returns Policy",
  faq: "FAQ",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

export const DEFAULT_PAGES: Record<PageSlug, PageContent> = {
  shipping: {
    eyebrow: "Policy",
    title: "Shipping",
    intro: "We ship daily Monday–Friday from our Birmingham warehouse. Orders placed before 2pm UK time go out the same working day.",
    updated: "12 June 2026",
    sections: [
      { h: "Where we ship", body: "United Kingdom only at this time. EU and US shipping coming soon — sign up to the newsletter to be notified." },
      { h: "Delivery options & cost", body: "Standard tracked delivery: £4.95 (free on orders over £75) — 2–4 working days via Royal Mail or DPD. Express tracked: surcharge calculated at checkout — next working day for orders placed before 2pm." },
      { h: "Tracking", body: "You'll receive a dispatch confirmation by email with your tracking link as soon as your order is collected by the carrier. If it hasn't arrived after 5 working days, reply to that email and we'll chase the carrier on your behalf." },
      { h: "Address accuracy", body: `We can only ship to the address provided at checkout. If you spot an error within 30 minutes of ordering, email ${COMPANY.email} — we may be able to amend before dispatch. Once shipped, we can't change the destination.` },
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
      { h: "Faulty or incorrect items", body: `If the item arrives damaged, faulty, or doesn't match the listing, email ${COMPANY.email} within 7 days of delivery with photos. We'll arrange a free return and a replacement or full refund — whichever you prefer. This doesn't affect your statutory rights under the UK Consumer Rights Act 2015.` },
    ],
  },
  faq: {
    eyebrow: "Help",
    title: "FAQ",
    intro: "Answers to the questions we get asked most. Can't find yours? Email " + COMPANY.email + " and we'll get back to you within one working day.",
    updated: "19 July 2026",
    sections: [
      { h: "Are your products authentic?", body: "Yes. Every item is verified in-house against the brand's references before it's listed. If you ever believe an item isn't authentic, we'll refund you in full." },
      { h: "How long does delivery take?", body: "UK standard delivery is 2–4 working days, tracked. Order before 2pm on a working day and in-stock items ship the same day. Free over £75." },
      { h: "Can you source something that's not on the site?", body: "Yes — that's our Personal Shopping service. Tell us what you're after via the Sourcing page and we'll work our supplier network to find it, with no obligation until you approve a price." },
      { h: "What's your returns policy?", body: "30 days to return any unworn item in original condition with tags attached. UK returns are free — see our Returns policy for the full details." },
      { h: "Which payment methods do you accept?", body: "Visa, Mastercard, American Express, Apple Pay, Google Pay, PayPal, Amazon Pay and Klarna — all handled securely by Stripe. We never see your card details." },
      { h: "Do you ship internationally?", body: "Not yet — UK only for now. EU and US shipping is coming soon; join the newsletter to be the first to know." },
    ],
  },
  contact: {
    eyebrow: "Say hello",
    title: "Contact",
    intro: "We're a small UK team and we read every message. The fastest way to reach us is email — we reply within one working day.",
    updated: "19 July 2026",
    sections: [
      { h: "Email", body: `General enquiries and order help: ${COMPANY.email}. For sourcing requests, use the Sourcing page so we capture the details we need.` },
      { h: "Order support", body: "Already ordered? Reply directly to your order confirmation email with your order number and we'll pick it straight up." },
      { h: "Hours", body: "Monday to Friday, 9am–6pm UK time (excluding bank holidays). Messages sent over the weekend are answered the next working day." },
      { h: "Company", body: `${COMPANY.name} · Company No. ${COMPANY.number} · ${COMPANY.city}.` },
    ],
  },
  privacy: {
    eyebrow: "Policy",
    title: "Privacy",
    intro: `${COMPANY.name} ("we", "us", "our") is the data controller for the personal information you provide via radnarsupply.com. We process your data under UK GDPR and the Data Protection Act 2018.`,
    updated: "12 June 2026",
    sections: [
      { h: "What we collect", body: "Account: name, email, password (hashed). Orders: shipping address, phone (optional), order history. Payments: handled by Stripe — we never see card details. Marketing: email for newsletter only if you opt in. Technical: IP address, browser, pages viewed (for security and analytics)." },
      { h: "Why we collect it", body: "To fulfil and ship your orders, to provide your account and order history, to send transactional emails (order confirmations, shipping updates, password reset), to comply with legal obligations (e.g. tax records), and — only if you opt in — to send marketing." },
      { h: "Who we share it with", body: "Stripe (payment processing), Resend (transactional and marketing email), UploadThing (image hosting), Royal Mail / DPD (delivery). Each is a processor bound by contract. We do not sell personal data." },
      { h: "How long we keep it", body: "Order and account data: 7 years after your last interaction, for tax-record compliance. Marketing subscribers: until you unsubscribe. Logs: 30 days." },
      { h: "Your rights", body: `Under UK GDPR you have the right to access, correct, erase, restrict, port, or object to processing of your data. Email ${COMPANY.email} with the subject "Data request" and we'll respond within 30 days.` },
      { h: "Cookies", body: "We use a small number of strictly-necessary cookies (cart, session) and — only if you accept — analytics cookies (Google Analytics 4). You can change cookie preferences at any time via the cookie banner." },
      { h: "Contact", body: `${COMPANY.name}, Birmingham, United Kingdom. Email: ${COMPANY.email}. Company No. ${COMPANY.number}.` },
    ],
  },
  terms: {
    eyebrow: "Policy",
    title: "Terms of Sale",
    intro: `By placing an order on radnarsupply.com you agree to these terms, which form the contract between you and ${COMPANY.name}. They do not affect your statutory rights as a consumer.`,
    updated: "12 June 2026",
    sections: [
      { h: "Who we are", body: `${COMPANY.name} (Company No. ${COMPANY.number}) is a company registered in England and Wales, trading as Radnar Supply, registered office in Birmingham, United Kingdom.` },
      { h: "Product authenticity", body: "Every product we sell is verified in-house against the brand's references before listing. If a product you receive is, in our or the brand's reasonable assessment, not authentic, you are entitled to a full refund — no questions." },
      { h: "Prices and currency", body: "Prices are shown in GBP (£) and include VAT where applicable. Shipping is calculated at checkout. We reserve the right to correct pricing errors before processing the order — if a correction would affect your order, we will contact you before charging." },
      { h: "Order acceptance", body: "Your order is an offer to buy. We accept the offer when we charge your payment method and dispatch the goods. Until dispatch, we may refuse or cancel an order — for example, if the item becomes out of stock, if we detect fraud, or for any other reasonable cause. In that case, you'll receive a full refund within 5 working days." },
      { h: "14-day cancellation right (Consumer Contracts Regulations)", body: `Under the Consumer Contracts Regulations 2013 you may cancel for any reason within 14 days of delivery. To exercise, email ${COMPANY.email} with your order number. Items must be returned within a further 14 days. We will refund within 14 days of receiving the item back, including standard shipping you paid (but not any premium upgrade).` },
      { h: "30-day returns (goodwill)", body: "Separately to the statutory right above, we offer 30-day no-quibble returns on unworn items with original tags. See our Returns policy for details." },
      { h: "Liability", body: "Our liability to you for any loss arising from a contract for sale is limited to the price you paid for the product. We do not limit liability for death, personal injury, or fraud — or anything else where the law forbids limitation." },
      { h: "Disputes & governing law", body: "These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales. UK consumers retain the right to bring proceedings in their local courts." },
    ],
  },
};

/** Get a page's content, merging any admin override over the defaults. */
export async function getPageContent(slug: PageSlug): Promise<PageContent> {
  const fallback = DEFAULT_PAGES[slug];
  const stored = await getSetting<Partial<PageContent>>(`page.${slug}`, {});
  return {
    ...fallback,
    ...stored,
    sections:
      Array.isArray(stored?.sections) && stored.sections.length > 0
        ? stored.sections
        : fallback.sections,
  };
}
