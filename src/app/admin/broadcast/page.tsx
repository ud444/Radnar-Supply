import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

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
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Marketing</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Drop Announcement</h1>
      <p className="mt-3 text-sm text-ink/65">Broadcast to your newsletter audience — new stock, drops, restocks.</p>

      {sp.sent ? <div className="mt-5 border border-green-300 bg-green-50 text-green-900 px-4 py-3 text-sm rounded-xl">Broadcast sent to your audience.</div> : null}
      {sp.error ? <div className="mt-5 border border-red-300 bg-red-50 text-red-900 px-4 py-3 text-sm rounded-xl">{sp.error}</div> : null}
      {!configured ? <div className="mt-5 border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm rounded-xl">Set <code>RESEND_API_KEY</code> and <code>RESEND_AUDIENCE_ID</code> to enable broadcasts.</div> : null}

      <form action={sendBroadcast} className="mt-6 space-y-4 bg-white border border-ink/12 rounded-2xl p-6 shadow-card">
        <label className="block">
          <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Subject line</span>
          <input name="subject" required placeholder="New in: this week's drop" className="mt-1 w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Heading (black bar)</span>
          <input name="heading" required placeholder="Fresh Stock" className="mt-1 w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Body (one paragraph per line)</span>
          <textarea name="body" required rows={5} placeholder={"Just landed — limited pairs, verified and below RRP.\nFirst access for the list before it goes public."} className="mt-1 w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Button label (optional)</span>
            <input name="ctaLabel" placeholder="Shop The Drop" className="mt-1 w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-bold">Button link (optional)</span>
            <input name="ctaHref" placeholder="https://radnarsupply.co.uk/shop?sort=newest" className="mt-1 w-full border border-ink/20 px-3 py-2.5 text-base focus:outline-none focus:border-ink rounded-[10px]" />
          </label>
        </div>
        <button disabled={!configured} className="btn btn-lg btn-block">Send to audience →</button>
      </form>
    </div>
  );
}
