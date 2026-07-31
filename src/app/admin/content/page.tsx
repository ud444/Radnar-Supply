import { requireAdmin } from "@/lib/auth";
import { getHomeContent, getHomeMedia } from "@/lib/content";
import { saveContent } from "./actions";
import { MediaManager } from "./MediaManager";
import {
  PageHeader, Card, Button, Field, TextareaField, SectionTitle,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await requireAdmin();
  const [content, media] = await Promise.all([getHomeContent(), getHomeMedia()]);

  const mediaSlots = [
    { key: "hero", label: "Hero image", url: media.hero },
    { key: "personal", label: "Personal Shopping", url: media.personal },
    { key: "editorial", label: "Editorial / About", url: media.editorial },
    { key: "categoryClothing", label: "Category · Clothing", url: media.categoryClothing },
    { key: "categoryShoes", label: "Category · Shoes", url: media.categoryShoes },
    { key: "categoryAccessories", label: "Category · Accessories", url: media.categoryAccessories },
    { key: "categoryFragrance", label: "Category · Fragrance", url: media.categoryFragrance },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Homepage"
        title="Content & media"
        description="Edit the homepage copy and swap imagery — changes go live immediately. A line break in a title field starts a new line, and the last line is highlighted."
      />

      {/* MEDIA */}
      <SectionTitle>Media</SectionTitle>
      <MediaManager slots={mediaSlots} />

      {/* CONTENT */}
      <form action={saveContent} className="mt-8 space-y-6">
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

        <Section title="Promo banner (scrolling, top of site)">
          <TA label="Messages — one per line" name="marquee" defaultValue={content.marquee.join("\n")} rows={6} />
        </Section>

        <Section title="Section headings">
          <div className="grid grid-cols-2 gap-3">
            <T label="Category · eyebrow" name="categoryEyebrow" defaultValue={content.categoryEyebrow} />
            <TA label="Category · title" name="categoryTitle" defaultValue={content.categoryTitle} rows={2} />
            <T label="Best sellers · eyebrow" name="featuredEyebrow" defaultValue={content.featuredEyebrow} />
            <TA label="Best sellers · title" name="featuredTitle" defaultValue={content.featuredTitle} rows={2} />
            <T label="Best sellers · button" name="featuredCtaLabel" defaultValue={content.featuredCtaLabel} />
            <div />
            <T label="New in · eyebrow" name="newInEyebrow" defaultValue={content.newInEyebrow} />
            <TA label="New in · title" name="newInTitle" defaultValue={content.newInTitle} rows={2} />
            <T label="New in · button" name="newInCtaLabel" defaultValue={content.newInCtaLabel} />
          </div>
        </Section>

        <Section title="Why Radnar (up to 5)">
          <div className="grid grid-cols-2 gap-3">
            <T label="Eyebrow" name="whyEyebrow" defaultValue={content.whyEyebrow} />
            <T label="Section title" name="whyTitle" defaultValue={content.whyTitle} />
          </div>
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

        <div className="sticky bottom-4">
          <Button>Save content</Button>
        </div>
      </form>
    </div>
  );
}

// Local wrappers over the shared primitives so the many call sites below stay
// terse — every field on this page is a plain labelled input or textarea.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <Card className="space-y-4">{children}</Card>
    </div>
  );
}

function T(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <Field {...props} />;
}

function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <TextareaField {...props} />;
}
