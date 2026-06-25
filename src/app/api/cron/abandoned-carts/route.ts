import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendAbandonedCart } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Abandoned-checkout reminder. Schedule this hourly (Replit Scheduled
 * Deployment or external cron) hitting:
 *   GET /api/cron/abandoned-carts?key=$CRON_SECRET
 * Emails PENDING orders left unpaid for 1h–7d, once each.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || key !== secret) return new NextResponse("unauthorized", { status: 401 });

  const now = Date.now();
  const orders = await db.order.findMany({
    where: {
      paymentStatus: "PENDING",
      abandonedNotifiedAt: null,
      createdAt: { lt: new Date(now - 60 * 60 * 1000), gt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
    },
    take: 100,
  });

  let sent = 0;
  for (const o of orders) {
    try {
      await sendAbandonedCart(o.id);
      await db.order.update({ where: { id: o.id }, data: { abandonedNotifiedAt: new Date() } });
      sent++;
    } catch (e) {
      console.error("abandoned mail", o.number, e);
    }
  }
  return NextResponse.json({ ok: true, scanned: orders.length, sent });
}
