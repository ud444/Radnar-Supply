import { requireAdmin } from "@/lib/auth";
import { getHomeContent, getHomeMedia } from "@/lib/content";
import { saveContent } from "./actions";
import { MediaManager } from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await requireAdmin();
  const [content, media] = await Promise.all([getHomeContent(), getHomeMedia()]);

  const mediaSlots = [
    { key: "hero", label: "Hero image", url: media.hero },
    { key: "personal", label: "Personal Shopping", url: media.personal },
    { key: "private", label: "Radnar Private", url: media.private },
    { key: "editorial", label: "Editorial / About", url: media.editorial },
    { key: "categoryClothing", label: "Category · Clothing", url: media.categoryClothing },
    { key: "categoryShoes", label: "Category · Shoes", url: media.categoryShoes },
    { key: "categoryAccessories", label: "Category · Accessories", url: media.categoryAccessories },
    { key: "categoryFragrance", label: "Category · Fragrance", url: media.categoryFragrance },
  ];

  return (
    <div className="max-w-4xl">
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Homepage</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Content &amp; Media</h1>
      <p className="text-sm text-ink/60 mt-2 max-w-xl">Edit the homepage copy and swap imagery. Changes go live immediately. Use a line break in a title field to start a new line (the last line is highlighted).</p>

      {/* MEDIA */}
      <h2 className="text-sm font-semibold mt-10 mb-3">Media</h2>
      <MediaManager slots={mediaSlots} />

      {/* CONTENT */}
      <form action={saveContent} className="mt-10 space-y-10">
        <Section title="Hero">
          <T label="Eyebrow" name="heroEyebrow" defaultValue={content.heroEyebrow} />
          <TA label="Title (one line per row)" name="heroTitle" defaultValue={content.heroTitle} rows={3} />
          <TA label="Body" name="heroBody" defaultValue={content.heroBody} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <T label="Primary button label" name="heroPrimaryLabel" defaultValue={content.heroPrimaryLabel} />
            <T label="Primary button link" name="heroPrimaryHref" defaultValue={content.heroPrimaryHref} />
            <T label="Secondary button label" name="heroSecondaryLabel" defaultValue={content.heroSecondaryLabel} />
            <T label="Secondary button link" name="heroSecondaryHref" defaultValue={content.heroSecondaryHref} />
          </div>
        </Section>

        <Section title="Personal Shopping section">
          <T label="Eyebrow" name="personalEyebrow" defaultValue={content.personalEyebrow} />
          <TA label="Title (one line per row)" name="personalTitle" defaultValue={content.personalTitle} rows={2} />
          <TA label="Body" name="personalBody" defaultValue={content.personalBody} rows={3} />
          <T label="Button label" name="personalCtaLabel" defaultValue={content.personalCtaLabel} />
        </Section>

        <Section title="Radnar Private section">
          <T label="Eyebrow" name="privateEyebrow" defaultValue={content.privateEyebrow} />
          <TA label="Title (one line per row)" name="privateTitle" defaultValue={content.privateTitle} rows={2} />
          <TA label="Body" name="privateBody" defaultValue={content.privateBody} rows={3} />
          <T label="Button label" name="privateCtaLabel" defaultValue={content.privateCtaLabel} />
        </Section>

        <Section title="Why Radnar (up to 5)">
          <T label="Section title" name="whyTitle" defaultValue={content.whyTitle} />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-line pt-3">
                <T label={`Item ${i + 1} heading`} name={`why_h_${i}`} defaultValue={content.whyItems[i]?.h ?? ""} />
                <div className="md:col-span-2">
                  <TA label={`Item ${i + 1} text`} name={`why_p_${i}`} defaultValue={content.whyItems[i]?.p ?? ""} rows={2} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <button className="bg-ink text-white py-3 text-sm font-medium px-8 sticky bottom-4">Save content</button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line p-6">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function T({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold">{label}</span>
      <input {...rest} className="mt-1 w-full border border-line px-3 py-2.5 text-sm" />
    </label>
  );
}

function TA({ label, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold">{label}</span>
      <textarea {...rest} className="mt-1 w-full border border-line px-3 py-2.5 text-sm" />
    </label>
  );
}
