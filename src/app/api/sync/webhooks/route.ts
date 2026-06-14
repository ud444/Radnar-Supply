import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

/** GET: list webhooks owned by the calling API key */
export async function GET(req: Request) {
  const { error, key } = await requireScope(req, "read");
  if (error) return error;

  const hooks = await db.webhook.findMany({
    where: { apiKeyId: key.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: hooks.map((h) => ({
      id: h.id,
      url: h.url,
      events: h.events.split(",").filter(Boolean),
      active: h.active,
      lastFiredAt: h.lastFiredAt,
      lastStatus: h.lastStatus,
      createdAt: h.createdAt,
      // secret never returned after creation
    })),
  });
}

/** POST: subscribe a new webhook.
 * Body: { url: string, events: string[], secret?: string }
 * Response: { id, url, events, secret }  ← secret returned ONLY on create.
 */
export async function POST(req: Request) {
  const { error, key } = await requireScope(req, "write");
  if (error) return error;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (typeof body?.url !== "string" || !/^https?:\/\//.test(body.url)) {
    return NextResponse.json({ error: "url must be http(s)://…" }, { status: 400 });
  }
  if (!Array.isArray(body?.events) || body.events.length === 0) {
    return NextResponse.json({ error: "events[] required (e.g. order.paid, product.updated)" }, { status: 400 });
  }

  const secret = body.secret && typeof body.secret === "string" && body.secret.length >= 16
    ? body.secret
    : `whsec_${crypto.randomBytes(24).toString("hex")}`;

  const hook = await db.webhook.create({
    data: {
      apiKeyId: key.id,
      url: body.url,
      events: body.events.join(","),
      secret,
      active: true,
    },
  });

  return NextResponse.json({
    id: hook.id,
    url: hook.url,
    events: hook.events.split(",").filter(Boolean),
    active: hook.active,
    secret,  // shown once
    createdAt: hook.createdAt,
  }, { status: 201 });
}
