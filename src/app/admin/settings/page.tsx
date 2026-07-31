import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";
import { PageHeader, Card, Button, Field, FieldRow } from "@/components/admin/ui";

export default async function Settings() {
  await requireAdmin();
  const [flat, freeAbove, storeName, tagline] = await Promise.all([
    getSetting<number>("shipping.flat_rate_pence", 495),
    getSetting<number>("shipping.free_threshold_pence", 7500),
    getSetting<string>("store.name", "Radnar Supply"),
    getSetting<string>("store.tagline", "Verified designer. Always below retail."),
  ]);

  async function save(fd: FormData) {
    "use server";
    await requireAdmin();
    await setSetting("shipping.flat_rate_pence", Math.round(Number(fd.get("flat")) * 100));
    await setSetting("shipping.free_threshold_pence", Math.round(Number(fd.get("freeAbove")) * 100));
    await setSetting("store.name", String(fd.get("storeName")));
    await setSetting("store.tagline", String(fd.get("tagline")));
    revalidatePath("/admin/settings");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Store"
        title="Settings"
        description="Store identity and delivery thresholds. These apply across the storefront and checkout."
      />

      <form action={save}>
        <Card className="grid gap-4">
          <Field label="Store name" name="storeName" defaultValue={storeName} />
          <Field label="Tagline" name="tagline" defaultValue={tagline} />
          <FieldRow>
            <Field
              label="Flat shipping rate" hint="£" name="flat" type="number" step="0.01"
              defaultValue={(flat / 100).toString()} className="tabular-nums"
            />
            <Field
              label="Free delivery above" hint="£" name="freeAbove" type="number" step="0.01"
              defaultValue={(freeAbove / 100).toString()} className="tabular-nums"
            />
          </FieldRow>
          <div className="pt-1">
            <Button>Save settings</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
