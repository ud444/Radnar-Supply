import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const key = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!key || !audienceId) {
      // Dev / not configured — log and accept so the UI flow works
      console.log(`[newsletter:dev] would subscribe ${email}`);
      return NextResponse.json({ ok: true });
    }

    const r = new Resend(key);
    await r.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("newsletter", e);
    return NextResponse.json({ error: e.message ?? "Subscribe failed" }, { status: 400 });
  }
}
