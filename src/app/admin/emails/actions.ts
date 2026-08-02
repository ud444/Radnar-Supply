"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { emailConfig, sendCustomEmail } from "@/lib/email";
import { ALL_EMAILS } from "@/lib/emailCatalogue";

/**
 * Fire a harmless sample of one lifecycle email to a chosen address.
 *
 * Deliberately renders through the branded shell with representative copy
 * rather than invoking the real sender: the real ones need an order or request
 * to exist, and we must never mutate live data just to test delivery.
 */
export async function sendTest(fd: FormData) {
  await requireAdmin();

  const id = String(fd.get("id") || "");
  const to = String(fd.get("to") || "").trim();
  const def = ALL_EMAILS.find((e) => e.id === id);

  if (!def) redirect("/admin/emails?error=Unknown+email");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    redirect("/admin/emails?error=Enter+a+valid+address+to+test+with");
  }

  try {
    await sendCustomEmail({
      to,
      subject: `[Test] ${def.name} · Radnar Supply`,
      heading: def.name,
      body:
        `This is a test of the "${def.name}" email.\n` +
        `In normal use it sends when: ${def.trigger}.\n` +
        `Recipient in normal use: ${def.audience}.\n` +
        `If this arrived, delivery is working and your sending domain is verified.`,
      ctaLabel: "Open the store",
    });
  } catch (e: any) {
    redirect(`/admin/emails?error=${encodeURIComponent(e?.message ?? "Send failed")}`);
  }

  redirect(`/admin/emails?sent=${encodeURIComponent(to)}`);
}

/** Compose and send a one-off email from the admin. */
export async function sendComposed(fd: FormData) {
  await requireAdmin();

  const to = String(fd.get("to") || "").trim();
  const subject = String(fd.get("subject") || "").trim();
  const heading = String(fd.get("heading") || "").trim();
  const body = String(fd.get("body") || "").trim();
  const ctaLabel = String(fd.get("ctaLabel") || "").trim() || undefined;
  const ctaHref = String(fd.get("ctaHref") || "").trim() || undefined;

  const cfg = emailConfig();
  if (!cfg.configured) {
    redirect("/admin/emails/new?error=Email+is+not+configured+—+set+RESEND_API_KEY");
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    redirect("/admin/emails/new?error=Enter+a+valid+recipient+address");
  }
  if (!subject || !heading || !body) {
    redirect("/admin/emails/new?error=Subject%2C+heading+and+message+are+all+required");
  }

  try {
    await sendCustomEmail({ to, subject, heading, body, ctaLabel, ctaHref });
  } catch (e: any) {
    redirect(`/admin/emails/new?error=${encodeURIComponent(e?.message ?? "Send failed")}`);
  }

  redirect(`/admin/emails?sent=${encodeURIComponent(to)}`);
}
