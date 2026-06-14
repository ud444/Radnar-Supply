import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";
import { dispatchWebhook } from "@/lib/webhook";

/**
 * Bulk set inventory by SKU.
 * Body: { updates: [{ sku: string, stock: number }, …] }
 * Response: { results: [{ sku, ok, stock?, error? }, …] }
 */
export async function POST(req: Request) {
  const { error } = await requireScope(req, "write");
  if (error) return error;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const updates: { sku: string; stock: number }[] = Array.isArray(body?.updates) ? body.updates : [];
  if (updates.length === 0) return NextResponse.json({ error: "updates[] required" }, { status: 400 });

  const results: { sku: string; ok: boolean; stock?: number; error?: string }[] = [];
  const changes: { sku: string; stock: number }[] = [];

  for (const u of updates) {
    if (typeof u.sku !== "string" || typeof u.stock !== "number" || u.stock < 0) {
      results.push({ sku: String(u?.sku), ok: false, error: "Invalid sku or stock" });
      continue;
    }
    try {
      const v = await db.variant.update({ where: { sku: u.sku }, data: { stock: Math.floor(u.stock) } });
      results.push({ sku: v.sku, ok: true, stock: v.stock });
      changes.push({ sku: v.sku, stock: v.stock });
    } catch (e: any) {
      results.push({ sku: u.sku, ok: false, error: e.code === "P2025" ? "SKU not found" : "Update failed" });
    }
  }

  if (changes.length > 0) dispatchWebhook("inventory.changed", { changes });
  return NextResponse.json({ results });
}
