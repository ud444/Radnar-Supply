import crypto from "crypto";
import { db } from "./prisma";

export type WebhookEvent =
  | "order.created"
  | "order.paid"
  | "order.shipped"
  | "order.delivered"
  | "order.cancelled"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "inventory.changed";

/**
 * Fan out an event to all matching webhook subscriptions.
 * Fire-and-forget — never blocks the request that triggered it.
 */
export function dispatchWebhook(event: WebhookEvent, data: Record<string, any>) {
  (async () => {
    const hooks = await db.webhook.findMany({
      where: { active: true, events: { contains: event } },
    });

    if (hooks.length === 0) return;

    const id = `wh_${crypto.randomBytes(12).toString("hex")}`;
    const payload = JSON.stringify({
      id,
      event,
      createdAt: new Date().toISOString(),
      data,
    });

    await Promise.allSettled(hooks.map(async (hook) => {
      // Defensive: events column is a csv, so make sure exact event matches
      if (!hook.events.split(",").map((s) => s.trim()).includes(event)) return;

      const signature = crypto.createHmac("sha256", hook.secret).update(payload).digest("hex");
      try {
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-radnar-event": event,
            "x-radnar-id": id,
            "x-radnar-signature": `sha256=${signature}`,
            "user-agent": "RadnarSupply-Webhook/1.0",
          },
          body: payload,
        });
        await db.webhook.update({
          where: { id: hook.id },
          data: { lastFiredAt: new Date(), lastStatus: res.status },
        }).catch(() => {});
      } catch {
        await db.webhook.update({
          where: { id: hook.id },
          data: { lastFiredAt: new Date(), lastStatus: 0 },
        }).catch(() => {});
      }
    }));
  })().catch(() => {});
}
