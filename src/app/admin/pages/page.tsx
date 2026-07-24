import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PAGE_SLUGS, PAGE_LABELS, getPageContent } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function PagesAdmin() {
  await requireAdmin();
  const pages = await Promise.all(
    PAGE_SLUGS.map(async (slug) => ({ slug, label: PAGE_LABELS[slug], content: await getPageContent(slug) })),
  );

  return (
    <div className="max-w-3xl">
      <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Content</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Pages</h1>
      <p className="text-sm text-ink/60 mt-2 max-w-xl">Edit the copy on your info and policy pages. Changes go live immediately. About Us has its own designed page and is edited from Content &amp; Media.</p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={`/admin/pages/${p.slug}`} className="flex items-center justify-between py-4 group">
              <div>
                <div className="font-medium group-hover:text-accent transition-colors">{p.label}</div>
                <div className="text-xs text-muted mt-0.5">/policies/{p.slug} · {p.content.sections.length} sections · updated {p.content.updated}</div>
              </div>
              <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/45 group-hover:text-accent">Edit →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
