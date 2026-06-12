import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { createProduct } from "../actions";

export default async function NewProduct() {
  await requireAdmin();
  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold tracking-tightest">New product</h1>
      <p className="text-sm text-muted mt-1">You'll add images and stock after creating the product.</p>

      <form action={createProduct} className="mt-6 grid gap-4 bg-white border border-line rounded p-6">
        <Field label="Name" name="name" required />
        <Field label="Slug (auto from name if blank)" name="slug" placeholder="e.g. boxy-tee-stone" />
        <label className="block">
          <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Description</span>
          <textarea name="description" rows={4} required className="mt-1 w-full border border-line rounded px-3 py-3 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Brand</span>
            <select name="brandId" required className="mt-1 w-full border border-line rounded px-3 py-3 text-sm">
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Category</span>
            <select name="categoryId" required className="mt-1 w-full border border-line rounded px-3 py-3 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <Field label="Price (£)" name="price" type="number" step="0.01" required />
        <Field label="Sizes (comma-separated)" name="sizes" placeholder="S, M, L, XL" required />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Live</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        </div>
        <button className="bg-ink text-white py-3 rounded text-sm font-medium mt-2 w-fit px-6">Create product</button>
      </form>
    </div>
  );
}
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.16em] uppercase text-muted">{label}</span>
      <input {...rest} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm" />
    </label>
  );
}
