import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { allow, isBot } from "@/lib/security";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Honeypot + rate limit (this endpoint sends an email to the address given)
    if (isBot(body)) return NextResponse.json({ ok: true });
    if (!(await allow("newsletter", 5, 60_000))) return NextResponse.json({ error: "Too many attempts — try again shortly." }, { status: 429 });
    const { email } = schema.parse(body);

    const key = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const { sendNewsletterWelcome } = await import("@/lib/email");

    if (!key || !audienceId) {
      // Dev / not configured — log and accept so the UI flow works
      console.log(`[newsletter:dev] would subscribe ${email}`);
      sendNewsletterWelcome(email).catch((e) => console.error("welcome mail", e));
      return NextResponse.json({ ok: true });
    }

    const r = new Resend(key);
    await r.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    sendNewsletterWelcome(email).catch((e) => console.error("welcome mail", e));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("newsletter", e);
    return NextResponse.json({ error: e.message ?? "Subscribe failed" }, { status: 400 });
  }
}
