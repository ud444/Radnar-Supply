import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

export default async function BlogAdmin() {
  await requireAdmin();
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-ink/55">Content</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase display-tight mt-1">Blog</h1>
        </div>
        <Link href="/admin/blog/new" className="bg-ink text-paper inline-flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-accent transition-colors">
          <Icon.plus /> New Post
        </Link>
      </div>

      <div className="bg-bone border border-ink/15 overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead className="bg-cream text-ink/65">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Title</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Slug</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Status</th>
              <th className="text-left px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-bold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-ink/55">No posts yet. Write your first SEO article.</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="border-t border-ink/10 hover:bg-cream/50">
                <td className="px-4 py-3"><Link href={`/admin/blog/${p.id}`} className="hover:text-accent font-medium">{p.title}</Link></td>
                <td className="px-4 py-3 text-ink/55 font-mono text-xs">/{p.slug}</td>
                <td className="px-4 py-3">
                  {p.published
                    ? <span className="text-[10px] px-2 py-1 border tracking-[0.14em] uppercase font-bold bg-green-100 text-green-800 border-green-300">published</span>
                    : <span className="text-[10px] px-2 py-1 border tracking-[0.14em] uppercase font-bold bg-cream text-ink/65 border-ink/20">draft</span>}
                </td>
                <td className="px-4 py-3 text-ink/55">{p.updatedAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
