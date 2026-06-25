import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendQuoteFollowup } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Quote follow-up. Schedule daily (Replit Scheduled Deployment or external
 * cron) hitting:
 *   GET /api/cron/quote-followups?key=$CRON_SECRET
 * Reminds QUOTED sourcing requests still unpaid after 48h, once each.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || key !== secret) return new NextResponse("unauthorized", { status: 401 });

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const requests = await db.sourcingRequest.findMany({
    where: {
      status: "QUOTED",
      quoteRemindedAt: null,
      quoteUrl: { not: null },
      updatedAt: { lt: cutoff },
    },
    take: 100,
  });

  let sent = 0;
  for (const rq of requests) {
    try {
      await sendQuoteFollowup(rq.id);
      await db.sourcingRequest.update({ where: { id: rq.id }, data: { quoteRemindedAt: new Date() } });
      sent++;
    } catch (e) {
      console.error("quote followup mail", rq.id, e);
    }
  }
  return NextResponse.json({ ok: true, scanned: requests.length, sent });
}
