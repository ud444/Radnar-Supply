import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPageContent, PAGE_SLUGS, PAGE_LABELS, type PageSlug } from "@/lib/pages";
import { savePage } from "../actions";

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
      <Link href="/admin/pages" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← All pages</Link>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-3">{PAGE_LABELS[slug]}</h1>
      <p className="text-sm text-ink/60 mt-2">
        Public page: <Link href={`/policies/${slug}`} target="_blank" className="underline hover:text-accent">/policies/{slug}</Link>. Leave a section blank to remove it.
      </p>

      <form action={save} className="mt-8 space-y-8">
        <div className="bg-white border border-line p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <T label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} />
            <T label="Last updated" name="updated" defaultValue={content.updated} />
          </div>
          <T label="Title" name="title" defaultValue={content.title} />
          <TA label="Intro" name="intro" defaultValue={content.intro} rows={3} />
        </div>

        <div className="bg-white border border-line p-6">
          <h2 className="text-sm font-semibold mb-4">Sections</h2>
          <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                <T label={`Section ${i + 1} heading`} name={`sec_h_${i}`} defaultValue={content.sections[i]?.h ?? ""} />
                <div className="mt-2">
                  <TA label="Body" name={`sec_b_${i}`} defaultValue={content.sections[i]?.body ?? ""} rows={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="bg-ink text-white py-3 text-sm font-medium px-8 sticky bottom-4">Save page</button>
      </form>
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
