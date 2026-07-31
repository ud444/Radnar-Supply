import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { CategoryImage } from "./CategoryImage";
import { PageHeader, Card, Button, Ident, EmptyState } from "@/components/admin/ui";

export default async function Categories() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, include: { products: true } });

  async function add(fd: FormData) {
    "use server";
    await requireAdmin();
    const name = String(fd.get("name")).trim();
    if (!name) return;
    await db.category.create({ data: { name, slug: slugify(name) } });
    revalidatePath("/admin/categories");
  }
  async function remove(id: string) {
    "use server";
    await requireAdmin();
    await db.category.delete({ where: { id } }).catch(() => {});
    revalidatePath("/admin/categories");
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Category images are used on the homepage tiles and the shop page."
      />

      <form action={add} className="flex gap-2 mb-5">
        <input
          name="name" placeholder="New category name" required
          className="flex-1 h-9 rounded-control border border-ink/15 bg-bone px-3 text-sm placeholder:text-ink/35 focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
        />
        <Button>Add category</Button>
      </form>

      <Card padded={false}>
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" hint="Add a category before creating products." />
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((c) => (
              <li key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <CategoryImage categoryId={c.id} imageUrl={c.imageUrl} />
                  <div className="min-w-0">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[12px] text-muted">
                      <Ident>/{c.slug}</Ident> · <span className="tabular-nums">{c.products.length}</span>{" "}
                      {c.products.length === 1 ? "product" : "products"}
                    </div>
                  </div>
                </div>
                <form action={remove.bind(null, c.id)}>
                  <Button
                    variant="ghost" size="sm" disabled={c.products.length > 0}
                    className={c.products.length > 0 ? "" : "text-danger hover:text-danger hover:bg-danger-tint"}
                  >
                    {c.products.length > 0 ? "In use" : "Delete"}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
