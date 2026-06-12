import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  updateProduct, deleteProduct, addVariant, setVariantStock, deleteVariant, deleteImage,
} from "../actions";
import { ProductImages } from "./ProductImages";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        brand: true, category: true,
        variants: { orderBy: { size: "asc" } },
        images:   { orderBy: { position: "asc" } },
      },
    }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tightest">{product.name}</h1>
          <div className="text-sm text-muted">/{product.slug}</div>
        </div>
        <form action={deleteProduct.bind(null, product.id)}>
          <button className="text-sm text-red-600 underline">Delete product</button>
        </form>
      </div>

      <form action={updateProduct.bind(null, product.id)} className="mt-6 grid gap-4 bg-white border border-line rounded p-6">
        <Field label="Name" name="name" defaultValue={product.name} />
        <label className="block">
          <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Description</span>
          <textarea name="description" rows={5} defaultValue={product.description} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Brand</span>
            <select name="brandId" defaultValue={product.brandId} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm">
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted">Category</span>
            <select name="categoryId" defaultValue={product.categoryId} className="mt-1 w-full border border-line rounded px-3 py-3 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <Field label="Price (£)" name="price" type="number" step="0.01" defaultValue={(product.priceCents / 100).toString()} />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={product.active} /> Live</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured</label>
        </div>
        <button className="bg-ink text-white py-3 rounded text-sm font-medium mt-2 w-fit px-6">Save changes</button>
      </form>

      <div className="mt-8 bg-white border border-line rounded p-6">
        <h2 className="text-sm font-medium">Images</h2>
        <ProductImages productId={product.id} images={product.images} deleteImage={deleteImage} />
      </div>

      <div className="mt-8 bg-white border border-line rounded p-6">
        <h2 className="text-sm font-medium mb-3">Variants</h2>
        <table className="w-full text-sm">
          <thead className="text-muted">
            <tr><th className="text-left py-2">Size</th><th className="text-left py-2">SKU</th><th className="text-right py-2">Stock</th><th className="py-2"></th></tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-t border-line">
                <td className="py-2">{v.size}</td>
                <td className="py-2 text-muted">{v.sku}</td>
                <td className="py-2">
                  <form action={async (fd: FormData) => { "use server"; await setVariantStock(v.id, Number(fd.get("stock"))); }} className="flex justify-end gap-2">
                    <input name="stock" type="number" defaultValue={v.stock} className="border border-line rounded px-2 py-1 w-20 text-right text-sm" />
                    <button className="text-xs underline">Save</button>
                  </form>
                </td>
                <td className="py-2 text-right">
                  <form action={deleteVariant.bind(null, v.id, product.id)}>
                    <button className="text-xs text-red-600 underline">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={async (fd: FormData) => { "use server"; await addVariant(product.id, String(fd.get("size"))); }} className="mt-4 flex gap-2">
          <input name="size" placeholder="New size (e.g. XL)" className="border border-line rounded px-3 py-2 text-sm" required />
          <button className="text-sm underline">Add variant</button>
        </form>
      </div>
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
