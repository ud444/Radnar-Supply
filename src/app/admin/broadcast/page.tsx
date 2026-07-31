import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  PageHeader, Card, Button, Field, TextareaField, FieldRow, Notice,
} from "@/components/admin/ui";

type SP = { sent?: string; error?: string };

async function sendBroadcast(fd: FormData) {
  "use server";
  await requireAdmin();
  const subject = String(fd.get("subject") || "").trim();
  const heading = String(fd.get("heading") || "").trim();
  const body = String(fd.get("body") || "").trim();
  const ctaLabel = String(fd.get("ctaLabel") || "").trim();
  const ctaHref = String(fd.get("ctaHref") || "").trim();

  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) redirect("/admin/broadcast?error=Resend+audience+not+configured");
  if (!subject || !heading || !body) redirect("/admin/broadcast?error=Subject%2C+heading+and+body+are+required");

  const { siteUrl } = await import("@/lib/url");
  const from = process.env.EMAIL_FROM || "Radnar Supply <onboarding@resend.dev>";
  const cta = ctaLabel
    ? `<a href="${ctaHref || `${siteUrl()}/shop`}" style="display:inline-block;margin-top:16px;background:#FF4D00;color:#fff;padding:14px 26px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none">${ctaLabel} →</a>`
    : "";
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#0A0A0A;color:#fff;padding:18px 22px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${heading}</div>
    <div style="border:1px solid #eee;border-top:none;padding:22px;color:#0A0A0A;font-size:15px;line-height:1.7">
      ${body.split("\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("")}
      ${cta}
      <p style="margin-top:22px;color:#888;font-size:12px">— Radnar Supply</p>
    </div>
  </div>`;

  try {
    const { Resend } = await import("resend");
    const r = new Resend(key);
    const created = await r.broadcasts.create({ audienceId, from, subject, html });
    const id = (created as any)?.data?.id;
    if (!id) throw new Error((created as any)?.error?.message || "Broadcast create failed");
    await r.broadcasts.send(id);
  } catch (e: any) {
    redirect(`/admin/broadcast?error=${encodeURIComponent(e.message ?? "Send failed")}`);
  }
  redirect("/admin/broadcast?sent=1");
}

export default async function BroadcastPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const configured = !!process.env.RESEND_API_KEY && !!process.env.RESEND_AUDIENCE_ID;

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Marketing"
        title="Drop announcement"
        description="Broadcast to your newsletter audience — new stock, drops, restocks."
      />

      {sp.sent ? <Notice tone="success">Broadcast sent to your audience.</Notice> : null}
      {sp.error ? <Notice tone="danger">{sp.error}</Notice> : null}
      {!configured ? (
        <Notice tone="warning">
          Set <code className="font-mono text-[12px]">RESEND_API_KEY</code> and{" "}
          <code className="font-mono text-[12px]">RESEND_AUDIENCE_ID</code> to enable broadcasts.
        </Notice>
      ) : null}

      <form action={sendBroadcast}>
        <Card className="space-y-4">
          <Field label="Subject line" name="subject" required placeholder="New in: this week's drop" />
          <Field label="Heading" hint="shown in the black bar" name="heading" required placeholder="Fresh stock" />
          <TextareaField
            label="Body" hint="one paragraph per line" name="body" required rows={5}
            placeholder={"Just landed — limited pairs, verified and below RRP.\nFirst access for the list before it goes public."}
          />
          <FieldRow>
            <Field label="Button label" hint="optional" name="ctaLabel" placeholder="Shop the drop" />
            <Field label="Button link" hint="optional" name="ctaHref" placeholder="https://…/shop?sort=newest" />
          </FieldRow>
          <div className="pt-1">
            <Button disabled={!configured} className="w-full">Send to audience →</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
