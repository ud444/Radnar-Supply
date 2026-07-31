import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { PageHeader, Card, Button, Ident, EmptyState } from "@/components/admin/ui";

export default async function Brands() {
  await requireAdmin();
  const brands = await db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });

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
      <PageHeader
        eyebrow="Catalogue"
        title="Brands"
        description="A brand can only be deleted once no products reference it."
      />

      <form action={add} className="flex gap-2 mb-5">
        <input
          name="name" placeholder="New brand name" required
          className="flex-1 h-9 rounded-control border border-ink/15 bg-bone px-3 text-sm placeholder:text-ink/35 focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
        />
        <Button>Add brand</Button>
      </form>

      <Card padded={false}>
        {brands.length === 0 ? (
          <EmptyState title="No brands yet" hint="Add a brand before creating products." />
        ) : (
          <ul className="divide-y divide-line/60">
            {brands.map((b) => (
              <li key={b.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-[12px] text-muted">
                    <Ident>/{b.slug}</Ident> · <span className="tabular-nums">{b._count.products}</span>{" "}
                    {b._count.products === 1 ? "product" : "products"}
                  </div>
                </div>
                <form action={remove.bind(null, b.id)}>
                  <Button
                    variant="ghost" size="sm" disabled={b._count.products > 0}
                    className={b._count.products > 0 ? "" : "text-danger hover:text-danger hover:bg-danger-tint"}
                  >
                    {b._count.products > 0 ? "In use" : "Delete"}
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
