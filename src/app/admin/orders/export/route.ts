import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const gbp = (cents: number) => (cents / 100).toFixed(2);

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const where: any = {};
  if (q)      where.OR = [{ number: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];
  if (status) where.status = status;

  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" } });

  const headers = [
    "Order","Date","Email","Status","Payment","Subtotal","Shipping","Total","Refunded",
    "Ship Name","Postcode","Country","Carrier","Tracking",
  ];
  const rows = orders.map((o) => [
    o.number, o.createdAt.toISOString(), o.email, o.status, o.paymentStatus,
    gbp(o.subtotalCents), gbp(o.shippingCents), gbp(o.totalCents), gbp(o.refundedCents),
    o.shipName, o.shipPostcode, o.shipCountry, o.trackingCarrier ?? "", o.trackingNumber ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(cell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
