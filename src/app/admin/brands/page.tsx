import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/format";

export default async function Brands() {
  await requireAdmin();
  const brands = await db.brand.findMany({ orderBy: { name: "asc" }, include: { products: true } });

  async function add(fd: FormData) {
    "use server";
    await requireAdmin();
    const name = String(fd.get("name")).trim();
    if (!name) return;
    await db.brand.create({ data: { name, slug: slugify(name) } });
    revalidatePath("/admin/brands");
  }
  async function remove(id: string) {
    "use server";
    await requireAdmin();
    await db.brand.delete({ where: { id } }).catch(() => {});
    revalidatePath("/admin/brands");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Brands</h1>
      <form action={add} className="mt-6 flex gap-2">
        <input name="name" placeholder="New brand name" className="flex-1 border border-line rounded px-3 py-2 text-sm" required />
        <button className="bg-ink text-white px-4 py-2 rounded text-sm">Add brand</button>
      </form>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {brands.map((b) => (
          <li key={b.id} className="py-3 flex items-center justify-between text-sm">
            <div>
              <div>{b.name}</div>
              <div className="text-xs text-muted">/{b.slug} · {b.products.length} products</div>
            </div>
            <form action={remove.bind(null, b.id)}>
              <button className="text-xs text-red-600 underline" disabled={b.products.length > 0}>
                {b.products.length > 0 ? "In use" : "Delete"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
