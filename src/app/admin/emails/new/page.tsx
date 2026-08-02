import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { emailConfig } from "@/lib/email";
import { db } from "@/lib/prisma";
import { sendComposed } from "../actions";
import {
  PageHeader, Card, Button, ButtonLink, Field, TextareaField, FieldRow, Notice, Eyebrow,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function NewEmail({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const cfg = emailConfig();

  // Offer recent customers as a convenience — the field stays free-text so any
  // address can be used.
  const recent = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: { email: true },
    take: 50,
  });

  return (
    <div className="max-w-2xl">
      <Link href="/admin/emails" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All emails
      </Link>

      <PageHeader
        eyebrow="Communications"
        title="New email"
        description="A one-off message in the Radnar template. For a send to your whole newsletter audience, use Broadcast instead."
        actions={<ButtonLink href="/admin/broadcast" variant="secondary">Broadcast →</ButtonLink>}
      />

      {sp.error ? <Notice tone="danger">{sp.error}</Notice> : null}
      {!cfg.configured ? (
        <Notice tone="warning">
          Email is not configured, so this will not send. Set{" "}
          <code className="font-mono text-[12px]">RESEND_API_KEY</code> first.
        </Notice>
      ) : null}

      <form action={sendComposed}>
        <Card className="space-y-4">
          <Field
            label="To" name="to" type="email" required
            defaultValue={sp.to ?? ""} placeholder="customer@example.com"
            list="recent-customers"
          />
          <datalist id="recent-customers">
            {recent.map((c) => <option key={c.email} value={c.email} />)}
          </datalist>

          <Field label="Subject" name="subject" required placeholder="About your order" />
          <Field
            label="Heading" hint="shown in the black bar at the top"
            name="heading" required placeholder="A quick update"
          />
          <TextareaField
            label="Message" hint="one paragraph per line" name="body" required rows={8}
            placeholder={"Thanks for your order — a quick note on timing.\nYour pair ships Monday and you'll get tracking as soon as it moves."}
          />

          <FieldRow>
            <Field label="Button label" hint="optional" name="ctaLabel" placeholder="View your order" />
            <Field label="Button link" hint="optional" name="ctaHref" placeholder="https://…" />
          </FieldRow>

          <div className="pt-1 flex items-center gap-3">
            <Button disabled={!cfg.configured}>Send email</Button>
            <span className="text-[12px] text-muted">Sends from {cfg.from}</span>
          </div>
        </Card>
      </form>

      <Card className="mt-6">
        <Eyebrow>Note</Eyebrow>
        <p className="text-[13px] text-muted mt-2">
          This sends immediately to one recipient and is not stored as a template. It is for
          one-off correspondence — a delay on an order, a follow-up on an enquiry — not campaigns.
        </p>
      </Card>
    </div>
  );
}
