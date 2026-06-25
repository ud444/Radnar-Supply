import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/prisma";
import { Reveal } from "@/components/shop/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal — Radnar Supply",
  description: "Sourcing guides, drop intel and buying advice from Radnar Supply — premium fashion, footwear, fragrance and luxury sourcing.",
};

export default async function BlogIndex() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-16">
      <div className="rule-eyebrow">The Journal</div>
      <h1 className="mt-6 font-display font-black text-6xl md:text-8xl uppercase display-tight">
        Sourcing<br/><span className="text-accent">notes.</span>
      </h1>
      <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink/75">
        Buying guides, sourcing intel and the stories behind the stock.
      </p>

      {posts.length === 0 ? (
        <div className="mt-16 border border-ink/15 p-12 text-center text-ink/55">
          No articles published yet — check back soon.
        </div>
      ) : (
        <Reveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-14">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
              <div className="aspect-[16/10] bg-cream overflow-hidden hover-lift rounded-2xl">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full grid place-items-center font-display font-black text-2xl uppercase text-ink/20">Radnar</div>
                )}
              </div>
              <div className="mt-4 text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">
                {p.publishedAt ? p.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
              </div>
              <h2 className="mt-2 font-display font-black text-2xl uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">{p.title}</h2>
              {p.excerpt ? <p className="mt-2 text-sm text-ink/70 leading-relaxed line-clamp-3">{p.excerpt}</p> : null}
            </Link>
          ))}
        </Reveal>
      )}
    </div>
  );
}
