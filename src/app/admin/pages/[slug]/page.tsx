import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPageContent, PAGE_SLUGS, PAGE_LABELS, type PageSlug } from "@/lib/pages";
import { savePage } from "../actions";
import {
  Card, Button, Field, TextareaField, FieldRow, SectionTitle, Ident,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const MAX_SECTIONS = 14;

function isSlug(s: string): s is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(s);
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const content = await getPageContent(slug);
  const save = savePage.bind(null, slug);

  // Render the existing sections plus two spare blank rows to add more.
  const rows = Math.min(MAX_SECTIONS, content.sections.length + 2);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pages" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All pages
      </Link>

      <div className="mt-3 pb-5 mb-6 border-b border-line">
        <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.01em]">{PAGE_LABELS[slug]}</h1>
        <p className="text-sm text-muted mt-1.5">
          Live at{" "}
          <Link href={`/policies/${slug}`} target="_blank" className="underline hover:text-accent">
            <Ident>/policies/{slug}</Ident>
          </Link>
          . Leave a section blank to remove it.
        </p>
      </div>

      <form action={save} className="space-y-6">
        <Card className="space-y-4">
          <FieldRow>
            <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} />
            <Field label="Last updated" name="updated" defaultValue={content.updated} />
          </FieldRow>
          <Field label="Title" name="title" defaultValue={content.title} />
          <TextareaField label="Intro" name="intro" defaultValue={content.intro} rows={3} />
        </Card>

        <div>
          <SectionTitle>Sections</SectionTitle>
          <Card className="space-y-5">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0 space-y-3">
                <Field
                  label={`Section ${i + 1} heading`}
                  name={`sec_h_${i}`}
                  defaultValue={content.sections[i]?.h ?? ""}
                />
                <TextareaField
                  label="Body" name={`sec_b_${i}`}
                  defaultValue={content.sections[i]?.body ?? ""} rows={3}
                />
              </div>
            ))}
          </Card>
        </div>

        <div className="sticky bottom-4">
          <Button>Save page</Button>
        </div>
      </form>
    </div>
  );
}
