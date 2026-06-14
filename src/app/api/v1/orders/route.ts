import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request) {
  const { error } = await requireScope(req, "orders.read");
  if (error) return error;

  const url    = new URL(req.url);
  const page   = Math.max(1, Number(url.searchParams.get("page")  ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const status = url.searchParams.get("status");
  const skip   = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      include: { items: true },
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map((o) => ({
      id: o.id,
      number: o.number,
      email: o.email,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotalCents: o.subtotalCents,
      shippingCents: o.shippingCents,
      totalCents: o.totalCents,
      currency: o.currency,
      shipping: {
        name: o.shipName, line1: o.shipLine1, line2: o.shipLine2,
        city: o.shipCity, postcode: o.shipPostcode, country: o.shipCountry,
        phone: o.shipPhone,
      },
      paymentMethod: o.paymentMethod,
      molliePaymentId: o.molliePaymentId,
      items: o.items.map((i) => ({
        sku: undefined, // sku lives on the Variant; OrderItem snapshots
        variantId: i.variantId,
        productName: i.productName,
        brandName: i.brandName,
        size: i.size,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
      })),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    page, limit, total,
    hasMore: skip + orders.length < total,
  });
}
