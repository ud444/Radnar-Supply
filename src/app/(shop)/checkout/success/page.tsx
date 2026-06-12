import Link from "next/link";
import { db } from "@/lib/prisma";

export default async function Success({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const { o } = await searchParams;
  const order = o ? await db.order.findUnique({ where: { number: o } }) : null;
  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-24 text-center">
      <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Confirmed</div>
      <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold tracking-tightest">Thank you for your order.</h1>
      <p className="mt-3 text-muted">A confirmation will land in your inbox. Order {order?.number ?? o}.</p>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/shop" className="bg-ink text-white px-6 py-3 rounded-full text-sm font-medium">Continue shopping</Link>
        <Link href="/account/orders" className="border border-ink px-6 py-3 rounded-full text-sm font-medium">View orders</Link>
      </div>
    </div>
  );
}
