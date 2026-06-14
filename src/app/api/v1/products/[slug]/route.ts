import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireScope } from "@/lib/apiKey";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { error } = await requireScope(req, "products.read");
  if (error) return error;
  const { slug } = await params;
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { slug: true, name: true } },
      category: { select: { slug: true, name: true } },
      variants: true,
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}
