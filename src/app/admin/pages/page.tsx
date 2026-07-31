import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PAGE_SLUGS, PAGE_LABELS, getPageContent } from "@/lib/pages";
import { PageHeader, Card, Ident } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PagesAdmin() {
  await requireAdmin();
  const pages = await Promise.all(
    PAGE_SLUGS.map(async (slug) => ({ slug, label: PAGE_LABELS[slug], content: await getPageContent(slug) })),
  );

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Content"
        title="Pages"
        description="Edit the copy on your info and policy pages — changes go live immediately. About Us has its own designed page and is edited from Content & media."
      />

      <Card padded={false}>
        <ul className="divide-y divide-line/60">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/pages/${p.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 group transition-colors hover:bg-cream/40">
                <div className="min-w-0">
                  <div className="font-medium group-hover:text-accent transition-colors">{p.label}</div>
                  <div className="text-[12px] text-muted mt-0.5">
                    <Ident>/policies/{p.slug}</Ident> ·{" "}
                    <span className="tabular-nums">{p.content.sections.length}</span> sections · updated {p.content.updated}
                  </div>
                </div>
                <span className="text-[13px] text-muted group-hover:text-accent transition-colors whitespace-nowrap">
                  Edit →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
