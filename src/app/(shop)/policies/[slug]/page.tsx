import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; body: string }> = {
  shipping: { title: "Shipping",
    body: "Standard UK delivery 2–4 working days. Free over £75. Tracked Express available at checkout. We ship daily Monday to Friday from Birmingham." },
  returns:  { title: "Returns",
    body: "30 days to return any unworn item with original tags. Initiate a return from your order email or by contacting hello@radnar.supply." },
  privacy:  { title: "Privacy",
    body: "We process your data to fulfil orders and improve your experience. Full GDPR / UK GDPR rights apply. Contact hello@radnar.supply for data requests." },
  terms:    { title: "Terms",
    body: "By placing an order you agree to our terms of sale: 14-day cancellation, 30-day returns, statutory rights unaffected." },
};

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-20">
      <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Policies</div>
      <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tightest">{page.title}</h1>
      <p className="mt-6 text-sm leading-relaxed text-ink/85">{page.body}</p>
    </div>
  );
}
