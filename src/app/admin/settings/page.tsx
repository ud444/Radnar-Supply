import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";

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
      <h1 className="text-2xl font-display font-semibold tracking-tightest">Settings</h1>
      <form action={save} className="mt-6 grid gap-4 bg-white border border-line rounded p-6">
        <Field label="Store name" name="storeName" defaultValue={storeName} />
        <Field label="Tagline" name="tagline" defaultValue={tagline} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Flat shipping rate (£)" name="flat" type="number" step="0.01" defaultValue={(flat / 100).toString()} />
          <Field label="Free delivery above (£)" name="freeAbove" type="number" step="0.01" defaultValue={(freeAbove / 100).toString()} />
        </div>
        <button className="bg-ink text-white py-3 rounded text-sm font-medium mt-2 w-fit px-6">Save settings</button>
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
