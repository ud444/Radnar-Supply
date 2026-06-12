import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";

export default async function AdminProducts() {
  await requireAdmin();
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true, variants: true, images: { take: 1, orderBy: { position: "asc" } } },
  });
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold tracking-tightest">Products</h1>
        <Link href="/admin/products/new" className="bg-ink text-white px-4 py-2 rounded text-sm">New product</Link>
      </div>
      <div className="mt-6 bg-white border border-line rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-soft text-muted">
            <tr>
              <th className="text-left px-4 py-2">Product</th>
              <th className="text-left px-4 py-2">Brand</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Stock</th>
              <th className="text-right px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((a, v) => a + v.stock, 0);
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      {p.images[0] && (/* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.images[0].url} alt="" className="w-10 h-12 object-cover rounded bg-soft" />
                      )}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted">/{p.slug}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.brand.name}</td>
                  <td className="px-4 py-3 text-right">{money(p.priceCents)}</td>
                  <td className="px-4 py-3 text-right">{stock}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs px-2 py-1 rounded ${p.active ? "bg-green-100 text-green-700" : "bg-soft text-muted"}`}>{p.active ? "Live" : "Hidden"}</span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No products yet — <Link href="/admin/products/new" className="underline">create one</Link>.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
