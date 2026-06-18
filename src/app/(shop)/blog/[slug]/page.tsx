import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return db.post.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found — Radnar Supply" };
  const title = post.metaTitle || `${post.title} — Radnar Supply`;
  const description = post.metaDescription || post.excerpt || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

// Minimal renderer: blank line = paragraph break, leading "## " = subheading.
function renderBody(body: string) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return <h2 key={i} className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight mt-10 mb-3">{block.slice(3)}</h2>;
    }
    return (
      <p key={i} className="text-[16px] md:text-[17px] leading-relaxed text-ink/85 mb-5">
        {block.split("\n").map((line, j) => (
          <span key={j}>{line}{j < block.split("\n").length - 1 ? <br /> : null}</span>
        ))}
      </p>
    );
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-16">
      <Link href="/blog" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← The Journal</Link>

      <div className="mt-6 text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">
        {post.publishedAt ? post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
      </div>
      <h1 className="mt-3 font-display font-black text-4xl md:text-6xl uppercase display-tight">{post.title}</h1>
      {post.excerpt ? <p className="mt-5 text-[18px] md:text-[20px] leading-snug text-ink/70 font-display font-medium">{post.excerpt}</p> : null}

      {post.coverImage ? (
        <div className="aspect-[16/9] bg-cream overflow-hidden mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}

      <div className="mt-10">{renderBody(post.body)}</div>

      <div className="mt-14 border-t border-ink/15 pt-8">
        <Link href="/shop" className="btn">Shop the stock →</Link>
      </div>
    </article>
  );
}
