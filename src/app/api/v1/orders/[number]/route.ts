import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { error } = await requireScope(req, "orders.read");
  if (error) return error;
  const { number } = await params;
  const o = await db.order.findUnique({ where: { number }, include: { items: true } });
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(o);
}

const VALID_STATUS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { error } = await requireScope(req, "orders.write");
  if (error) return error;
  const { number } = await params;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const status = body?.status;
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: `status must be one of ${VALID_STATUS.join(", ")}` }, { status: 400 });
  }

  const o = await db.order.update({ where: { number }, data: { status } }).catch(() => null);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, status: o.status });
}
