import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./prisma";

const COOKIE = "rs_cart";
const secret = () => process.env.AUTH_SECRET || "dev-only-not-secure";

type Line = { variantId: string; qty: number };
type Cart = { lines: Line[] };

const sign = (body: string) =>
  crypto.createHmac("sha256", secret()).update(body).digest("base64url");

async function readCart(): Promise<Cart> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return { lines: [] };
  const [body, sig] = raw.split(".");
  if (!body || !sig || sign(body) !== sig) return { lines: [] };
  try { return JSON.parse(Buffer.from(body, "base64url").toString("utf8")); }
  catch { return { lines: [] }; }
}

async function writeCart(cart: Cart) {
  const body = Buffer.from(JSON.stringify(cart)).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true, sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export async function addToCart(variantId: string, qty = 1) {
  const variant = await db.variant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Variant unavailable");
  const cart = await readCart();
  const existing = cart.lines.find((l) => l.variantId === variantId);
  const want = (existing?.qty ?? 0) + qty;
  if (want > variant.stock) throw new Error(`Only ${variant.stock} left in size ${variant.size}`);
  if (existing) existing.qty = want;
  else cart.lines.push({ variantId, qty });
  await writeCart(cart);
}

export async function updateQty(variantId: string, qty: number) {
  const cart = await readCart();
  if (qty <= 0) cart.lines = cart.lines.filter((l) => l.variantId !== variantId);
  else {
    const variant = await db.variant.findUnique({ where: { id: variantId } });
    if (!variant) return;
    const line = cart.lines.find((l) => l.variantId === variantId);
    if (line) line.qty = Math.min(qty, variant.stock);
  }
  await writeCart(cart);
}

export async function removeLine(variantId: string) { return updateQty(variantId, 0); }
export async function clearCart() { await writeCart({ lines: [] }); }

export type CartView = Awaited<ReturnType<typeof getCart>>;
export async function getCart() {
  const cart = await readCart();
  if (!cart.lines.length) return { lines: [] as any[], subtotalCents: 0, count: 0 };
  const variants = await db.variant.findMany({
    where: { id: { in: cart.lines.map((l) => l.variantId) } },
    include: {
      product: {
        include: {
          brand: true,
          images: { take: 1, orderBy: { position: "asc" } },
        },
      },
    },
  });
  const lines = cart.lines.flatMap((l) => {
    const v = variants.find((x) => x.id === l.variantId);
    if (!v) return [];
    return [{
      variantId: v.id, qty: l.qty, size: v.size, stock: v.stock,
      productName: v.product.name, brandName: v.product.brand.name,
      slug: v.product.slug,
      imageUrl: v.product.images[0]?.url ?? "",
      unitCents: v.product.priceCents,
      lineCents: v.product.priceCents * l.qty,
    }];
  });
  const subtotalCents = lines.reduce((a, l) => a + l.lineCents, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return { lines, subtotalCents, count };
}
