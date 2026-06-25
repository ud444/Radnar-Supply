import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Icon } from "@/components/admin/icons";

type SP = { q?: string; status?: "live" | "hidden"; archived?: string; deleted?: string };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;

  const where: any = {};
  if (sp.q) where.OR = [
    { name: { contains: sp.q, mode: "insensitive" } },
    { slug: { contains: sp.q, mode: "insensitive" } },
    { brand: { name: { contains: sp.q, mode: "insensitive" } } },
  ];
  if (sp.status === "live")   where.active = true;
  if (sp.status === "hidden") where.active = false;

  const products = await db.product.findMany({
    where, orderBy: { createdAt: "desc" },
    include: { brand: true, variants: true, images: { take: 1, orderBy: { position: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Catalogue</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Products</h1>
        </div>
        <Link href="/admin/products/new" className="bg-ink text-paper inline-flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
          <Icon.plus /> New Product
        </Link>
      </div>

      {sp.archived ? (
        <div className="mt-5 border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          This product had order history, so it was <strong>archived</strong> (hidden from the storefront) rather than deleted — its orders stay intact. Filter by <strong>Hidden</strong> to find it.
        </div>
      ) : null}
      {sp.deleted ? (
        <div className="mt-5 border border-green-300 bg-green-50 text-green-900 px-4 py-3 text-sm">
          Product deleted.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <form action="/admin/products" className="flex-1 min-w-[260px] relative">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <Icon.search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search by name, slug, brand…" className="w-full bg-bone border border-ink/20 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink" />
        </form>
        <div className="flex gap-1.5">
          <Link href={`/admin/products${sp.q ? `?q=${sp.q}` : ""}`} className={`text-[11px] tracking-[0.18em] uppercase font-bold px-3 py-2 border ${!sp.status ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>All</Link>
          <Link href={`/admin/products?status=live${sp.q ? `&q=${sp.q}` : ""}`} className={`text-[11px] tracking-[0.18em] uppercase font-bold px-3 py-2 border ${sp.status === "live" ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>Live</Link>
          <Link href={`/admin/products?status=hidden${sp.q ? `&q=${sp.q}` : ""}`} className={`text-[11px] tracking-[0.18em] uppercase font-bold px-3 py-2 border ${sp.status === "hidden" ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>Hidden</Link>
        </div>
      </div>

      <div className="mt-6 bg-bone border border-ink/15 overflow-hidden rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Product</th>
              <th className="text-left px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Brand</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Price</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Stock</th>
              <th className="text-right px-4 py-2.5 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-ink/55">
                {sp.q ? "Nothing matches." : <>No products yet — <Link href="/admin/products/new" className="underline text-ink">create one</Link>.</>}
              </td></tr>
            ) : products.map((p) => {
              const stock = p.variants.reduce((a, v) => a + v.stock, 0);
              const oos = stock === 0;
              return (
                <tr key={p.id} className="border-t border-ink/10 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      {p.images[0] ? (/* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.images[0].url} alt="" className="w-10 h-12 object-cover bg-cream" />
                      ) : <div className="w-10 h-12 bg-cream border border-ink/10" />}
                      <div>
                        <div className="font-medium hover:text-accent">{p.name}</div>
                        <div className="text-xs text-ink/55">/{p.slug}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.brand.name}</td>
                  <td className="px-4 py-3 text-right font-medium">{money(p.priceCents)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${oos ? "text-red-600" : ""}`}>{stock}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] px-2 py-1 border tracking-[0.14em] uppercase font-bold ${p.active ? "bg-green-100 text-green-800 border-green-300" : "bg-cream text-ink/55 border-ink/20"}`}>
                      {p.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
