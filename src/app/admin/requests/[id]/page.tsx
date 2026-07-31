import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { stripe, siteUrl } from "@/lib/stripe";
import { money } from "@/lib/format";
import { sendSourcingQuote, sendQuoteAdminConfirmation } from "@/lib/email";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Card, Button, Field, TextareaField, SelectField, SectionTitle, Eyebrow,
  Notice, btn,
} from "@/components/admin/ui";

export default async function RequestDetail({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quote?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { quote: quoteFlag } = await searchParams;
  const r = await db.sourcingRequest.findUnique({ where: { id } });
  if (!r) notFound();

  let images: string[] = [];
  try { const p = JSON.parse(r.imageUrls); if (Array.isArray(p)) images = p; } catch {}

  async function save(fd: FormData) {
    "use server";
    await requireAdmin();
    await db.sourcingRequest.update({
      where: { id },
      data: {
        status: String(fd.get("status")) as any,
        notes: String(fd.get("notes") || "") || null,
      },
    });
    revalidatePath(`/admin/requests/${id}`);
    revalidatePath("/admin/requests");
  }

  // Create (or reuse) a Stripe Payment Link for the quoted price and email it to
  // the customer + the admin inbox. A straight re-send of an unchanged quote reuses
  // the existing link, so "Resend" works even if Stripe is briefly unavailable.
  async function sendQuote(fd: FormData) {
    "use server";
    await requireAdmin();
    const current = await db.sourcingRequest.findUniqueOrThrow({ where: { id } });
    const pounds = parseFloat(String(fd.get("amount") || "0"));
    const amountCents = Math.round((isNaN(pounds) ? 0 : pounds) * 100);
    const detail = String(fd.get("detail") || "").trim() || current.item;
    if (amountCents < 50) throw new Error("Quote must be at least £0.50");

    const unchanged =
      !!current.quoteUrl && current.quoteCents === amountCents && current.quoteDetail === detail;

    let payUrl = current.quoteUrl ?? "";
    if (!unchanged) {
      const price = await stripe().prices.create({
        currency: "gbp",
        unit_amount: amountCents,
        product_data: { name: `Radnar Sourcing — ${detail}`.slice(0, 250) },
      });
      const link = await stripe().paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { sourcingRequestId: id, email: current.email },
        after_completion: { type: "redirect", redirect: { url: `${siteUrl()}/checkout/success` } },
      });
      payUrl = link.url;
    }

    await db.sourcingRequest.update({
      where: { id },
      data: { status: "QUOTED", quoteCents: amountCents, quoteDetail: detail, quoteUrl: payUrl },
    });

    // Email the customer and confirm to the admin inbox. Surface failures rather
    // than silently swallowing them, so the admin knows if the customer wasn't reached.
    let emailed = true;
    try {
      await sendSourcingQuote({ to: current.email, name: current.name, item: current.item, amountCents, detail, payUrl });
      await sendQuoteAdminConfirmation({
        requestId: id, customerName: current.name, customerEmail: current.email,
        item: current.item, amountCents, payUrl, resent: unchanged,
      });
    } catch (e) { console.error("[quote email] failed:", e); emailed = false; }

    revalidatePath(`/admin/requests/${id}`);
    revalidatePath("/admin/requests");
    redirect(`/admin/requests/${id}?quote=${emailed ? "sent" : "emailfail"}`);
  }

  const field = (label: string, value?: string | null) =>
    value ? (
      <div>
        <Eyebrow>{label}</Eyebrow>
        <div className="text-sm mt-1 whitespace-pre-wrap">{value}</div>
      </div>
    ) : null;

  return (
    <div className="max-w-4xl">
      {quoteFlag === "sent" ? (
        <Notice tone="success">Quote sent — the customer and the admin inbox have both been emailed.</Notice>
      ) : quoteFlag === "emailfail" ? (
        <Notice tone="warning">
          Quote saved and the Stripe link is ready, but the email could not be sent.
          Check <code className="font-mono text-[12px]">RESEND_API_KEY</code> and{" "}
          <code className="font-mono text-[12px]">EMAIL_FROM</code>, then send it again.
        </Notice>
      ) : null}

      <Link href="/admin/requests" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All requests
      </Link>

      <div className="mt-3 pb-5 mb-6 border-b border-line flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.01em]">{r.name}</h1>
            <StatusBadge value={r.status} />
          </div>
          <div className="text-sm text-muted mt-1.5">
            {r.type === "PRIVATE" ? "Private sourcing" : "Personal shopping"} · {r.createdAt.toLocaleString("en-GB")}
          </div>
        </div>
        <a
          href={`mailto:${r.email}?subject=${encodeURIComponent(`Your Radnar Supply request: ${r.item}`)}`}
          className={btn("primary")}
        >
          Reply by email →
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
        <div className="md:col-span-2">
          <Card className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {field("Email", r.email)}
              {field("Phone", r.phone)}
              {field("Size", r.size)}
              {field("Budget", r.budget)}
            </div>
            {field("Item", r.item)}
            {field("Detail", r.detail)}
            {images.length > 0 ? (
              <div>
                <Eyebrow className="mb-2">Reference images</Eyebrow>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((u) => (
                    <a
                      key={u} href={u} target="_blank" rel="noreferrer"
                      className="block rounded-[6px] overflow-hidden border border-line hover:border-ink/40 transition-colors"
                    >
                      {/* Customer-supplied URL from UploadThing — dimensions unknown,
                          and next/image would need every possible host allow-listed. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="aspect-square object-cover bg-cream w-full" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6 h-fit">
          <div>
            <SectionTitle>Progress</SectionTitle>
            <form action={save}>
              <Card className="space-y-4">
                <SelectField label="Status" name="status" defaultValue={r.status}>
                  {["NEW", "IN_PROGRESS", "QUOTED", "SOURCED", "CLOSED"].map((s) => {
                    const t = s.replace(/_/g, " ").toLowerCase();
                    return <option key={s} value={s}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>;
                  })}
                </SelectField>
                <TextareaField
                  label="Internal notes" name="notes" rows={6} defaultValue={r.notes ?? ""}
                  placeholder="Sourcing progress, supplier quotes, next steps…"
                />
                <Button className="w-full">Save</Button>
              </Card>
            </form>
          </div>

          <div>
            <SectionTitle>Quote</SectionTitle>
            <form action={sendQuote}>
              <div className="bg-bone border border-accent/30 rounded-card p-5 space-y-3.5">
                {r.quoteUrl ? (
                  <div className="rounded-control bg-cream border border-line p-3 space-y-1 text-[12px]">
                    <div className="font-medium">
                      Quoted <span className="tabular-nums">{money(r.quoteCents ?? 0)}</span>
                    </div>
                    <div className="text-muted whitespace-pre-wrap">{r.quoteDetail}</div>
                    <a
                      href={r.quoteUrl} target="_blank" rel="noreferrer"
                      className="text-accent break-all hover:underline block pt-1"
                    >
                      {r.quoteUrl}
                    </a>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted">
                    Set a price and Radnar generates a Stripe pay-now link, then emails it to {r.email}.
                  </p>
                )}
                <Field label="What you're quoting" name="detail" defaultValue={r.quoteDetail ?? r.item} />
                <Field
                  label="Price" hint="£" name="amount" type="number" step="0.01" min="0.50"
                  defaultValue={r.quoteCents ? (r.quoteCents / 100).toFixed(2) : ""}
                  placeholder="0.00" className="tabular-nums"
                />
                <Button className="w-full">
                  {r.quoteUrl ? "Update and re-send quote" : "Generate link and email customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
