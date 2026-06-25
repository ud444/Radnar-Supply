import { db } from "./prisma";
import { sendBackInStock } from "./email";
import { siteUrl } from "./url";

/**
 * Email everyone waiting on a now-restocked product, then mark them notified
 * so they're only told once. Safe to call whenever a variant's stock rises.
 */
export async function notifyBackInStock(productId: string) {
  const [product, waiting] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, include: { brand: true } }),
    db.stockNotice.findMany({ where: { productId, notifiedAt: null } }),
  ]);
  if (!product || waiting.length === 0) return;

  const base = siteUrl();
  for (const n of waiting) {
    try {
      await sendBackInStock({
        to: n.email,
        productName: product.name,
        brandName: product.brand.name,
        slug: product.slug,
        siteUrl: base,
      });
      await db.stockNotice.update({ where: { id: n.id }, data: { notifiedAt: new Date() } });
    } catch (e) {
      console.error("back-in-stock mail", e);
    }
  }
}
