import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import {
  updateProduct, deleteProduct, addVariant, setVariantStock, deleteVariant, deleteImage,
} from "../actions";
import { ProductImages } from "./ProductImages";
import {
  PageHeader, Button, Card, SectionTitle, Field, TextareaField, SelectField,
  Checkbox, FieldRow, Table, THead, Th, Tr, Td, Ident, EmptyState,
} from "@/components/admin/ui";

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
      <PageHeader
        eyebrow="Product"
        title={product.name}
        description={`/${product.slug}`}
        actions={
          <form action={deleteProduct.bind(null, product.id)}>
            <Button variant="danger" size="md">Delete product</Button>
          </form>
        }
      />

      <form action={updateProduct.bind(null, product.id)}>
        <Card className="grid gap-4">
          <Field label="Name" name="name" defaultValue={product.name} />
          <TextareaField label="Description" name="description" rows={5} defaultValue={product.description} />

          <FieldRow>
            <SelectField label="Brand" name="brandId" defaultValue={product.brandId}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </SelectField>
            <SelectField label="Category" name="categoryId" defaultValue={product.categoryId}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectField>
          </FieldRow>

          <FieldRow>
            <Field
              label="Price" hint="£" name="price" type="number" step="0.01"
              defaultValue={(product.priceCents / 100).toString()}
            />
            <Field
              label="Colour" hint="optional" name="colour"
              defaultValue={product.colour ?? ""} placeholder="e.g. Black"
            />
          </FieldRow>

          <FieldRow>
            <SelectField label="Gender" hint="optional" name="gender" defaultValue={product.gender ?? ""}>
              <option value="">—</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </SelectField>
            <div className="flex items-end gap-6 pb-1">
              <Checkbox label="Live" name="active" defaultChecked={product.active} />
              <Checkbox label="Featured" name="featured" defaultChecked={product.featured} />
            </div>
          </FieldRow>

          <div className="pt-1">
            <Button>Save changes</Button>
          </div>
        </Card>
      </form>

      <div className="mt-6">
        <SectionTitle>Images</SectionTitle>
        <Card>
          <ProductImages productId={product.id} images={product.images} deleteImage={deleteImage} />
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle>Variants</SectionTitle>
        <Card padded={false}>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <tr>
                  <Th>Size</Th><Th>SKU</Th><Th align="right">Stock</Th><Th />
                </tr>
              </THead>
              <tbody>
                {product.variants.length === 0 ? (
                  <tr>
                    <Td colSpan={4}>
                      <EmptyState
                        title="No variants yet"
                        hint="Add at least one size so the product can be bought."
                      />
                    </Td>
                  </tr>
                ) : product.variants.map((v) => (
                  <Tr key={v.id}>
                    <Td className="font-medium">{v.size}</Td>
                    <Td><Ident>{v.sku}</Ident></Td>
                    <Td align="right">
                      <form
                        action={async (fd: FormData) => {
                          "use server";
                          await setVariantStock(v.id, Number(fd.get("stock")));
                        }}
                        className="flex justify-end items-center gap-2"
                      >
                        <input
                          name="stock" type="number" defaultValue={v.stock}
                          className="h-8 w-20 rounded-control border border-ink/15 bg-bone px-2 text-right text-sm tabular-nums focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
                        />
                        <Button variant="secondary" size="sm">Save</Button>
                      </form>
                    </Td>
                    <Td align="right">
                      <form action={deleteVariant.bind(null, v.id, product.id)}>
                        <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger-tint">
                          Remove
                        </Button>
                      </form>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>

          <form
            action={async (fd: FormData) => {
              "use server";
              await addVariant(product.id, String(fd.get("size")));
            }}
            className="flex gap-2 border-t border-line p-4"
          >
            <input
              name="size" placeholder="New size, e.g. XL" required
              className="h-9 flex-1 max-w-[220px] rounded-control border border-ink/15 bg-bone px-3 text-sm placeholder:text-ink/35 focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-accent/25"
            />
            <Button variant="secondary">Add variant</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
