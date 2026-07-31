import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { createProduct } from "../actions";
import {
  PageHeader, Card, Button, ButtonLink, Field, TextareaField, SelectField,
  Checkbox, FieldRow,
} from "@/components/admin/ui";

export default async function NewProduct() {
  await requireAdmin();
  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Catalogue"
        title="New product"
        description="You'll add images and stock after creating it."
        actions={<ButtonLink href="/admin/products" variant="secondary">Cancel</ButtonLink>}
      />

      <form action={createProduct}>
        <Card className="grid gap-4">
          <Field label="Name" name="name" required />
          <Field label="Slug" hint="generated from the name if left blank" name="slug" placeholder="e.g. boxy-tee-stone" />
          <TextareaField label="Description" name="description" rows={4} required />

          <FieldRow>
            <SelectField label="Brand" name="brandId" required>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </SelectField>
            <SelectField label="Category" name="categoryId" required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectField>
          </FieldRow>

          <FieldRow>
            <Field label="Price" hint="£" name="price" type="number" step="0.01" required />
            <Field label="Colour" hint="optional" name="colour" placeholder="e.g. Black" />
          </FieldRow>

          <FieldRow>
            <SelectField label="Gender" hint="optional" name="gender" defaultValue="">
              <option value="">—</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </SelectField>
            <Field label="Sizes" hint="comma-separated" name="sizes" placeholder="S, M, L, XL" required />
          </FieldRow>

          <div className="flex gap-6">
            <Checkbox label="Live" name="active" defaultChecked />
            <Checkbox label="Featured" name="featured" />
          </div>

          <div className="pt-1">
            <Button>Create product</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
