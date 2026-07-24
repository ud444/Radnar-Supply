import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPageContent, PAGE_SLUGS, PAGE_LABELS, COMPANY_INFO, type PageSlug } from "@/lib/pages";

const COMPANY = COMPANY_INFO;

function isSlug(s: string): s is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(s);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const page = await getPageContent(slug);
  return { title: page.title, description: page.intro.slice(0, 155) };
}

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const page = await getPageContent(slug);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="text-[11px] tracking-[0.22em] uppercase text-ink/55 font-bold">{page.eyebrow}</div>
      <h1 className="mt-2 font-display font-black text-5xl md:text-7xl uppercase display-tight">{page.title}</h1>
      <p className="mt-6 text-[16px] text-ink/80 leading-relaxed">{page.intro}</p>
      <div className="mt-3 text-[11px] tracking-[0.18em] uppercase font-bold text-ink/45">Last updated · {page.updated}</div>

      <div className="mt-12 space-y-10">
        {page.sections.map((s, i) => (
          <section key={`${s.h}-${i}`}>
            <h2 className="font-display font-bold uppercase text-xl md:text-2xl tracking-tight">{s.h}</h2>
            <p className="mt-3 text-[15px] text-ink/85 leading-relaxed whitespace-pre-wrap">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-ink/15 text-sm text-ink/60">
        {COMPANY.name} · Company No. <span className="font-mono">{COMPANY.number}</span> · {COMPANY.city} · <Link href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {PAGE_SLUGS.filter((s) => s !== slug).map((s) => (
          <Link key={s} href={`/policies/${s}`} className="border-2 border-ink/30 hover:border-ink px-4 py-2 text-[11px] tracking-[0.22em] uppercase font-bold">{PAGE_LABELS[s]}</Link>
        ))}
      </div>
    </div>
  );
}
