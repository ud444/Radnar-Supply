import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request) {
  const { error } = await requireScope(req, "customers.read");
  if (error) return error;

  const url   = new URL(req.url);
  const page  = Math.max(1, Number(url.searchParams.get("page")  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const skip  = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" }, skip, take: limit,
      include: { _count: { select: { orders: true } } },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return NextResponse.json({
    data: customers.map((c) => ({
      id: c.id, email: c.email, name: c.name, phone: c.phone,
      orderCount: c._count.orders,
      createdAt: c.createdAt,
    })),
    page, limit, total,
    hasMore: skip + customers.length < total,
  });
}
