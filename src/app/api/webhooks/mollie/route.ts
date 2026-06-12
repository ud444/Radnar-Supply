import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { mollie } from "@/lib/mollie";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return new NextResponse("missing id", { status: 400 });

  // Re-fetch from Mollie. Mollie's official guidance: never trust the body.
  const payment = await mollie().payments.get(id);
  const order = await db.order.findUnique({
    where: { molliePaymentId: id }, include: { items: true },
  });
  if (!order) return NextResponse.json({ ok: true }); // 200 so Mollie stops retrying

  // Map Mollie payment.status -> our PaymentStatus enum
  const map: Record<string, "PAID" | "FAILED" | "PENDING"> = {
    paid: "PAID", canceled: "FAILED", expired: "FAILED", failed: "FAILED",
  };
  const pStatus = map[payment.status] ?? "PENDING";

  await db.$transaction(async (tx) => {
    // PAID path
    if (order.paymentStatus !== "PAID" && pStatus === "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID", status: "PAID",
          paymentMethod: payment.method ?? null,
        },
      });
    }
    // Cancelled / failed — release reserved stock if we haven't already
    if (pStatus === "FAILED" && order.paymentStatus === "PENDING") {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
      for (const i of order.items) {
        await tx.variant.update({
          where: { id: i.variantId },
          data: { stock: { increment: i.quantity } },
        });
      }
    }
  });

  // Email outside the transaction
  if (order.paymentStatus !== "PAID" && pStatus === "PAID") {
    try { await sendOrderConfirmation(order.id); } catch (e) { console.error("email", e); }
  }

  return NextResponse.json({ ok: true });
}
