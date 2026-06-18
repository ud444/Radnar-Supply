import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { updatePost, deletePost } from "../actions";
import { PostForm } from "../PostForm";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  const update = updatePost.bind(null, id);
  const remove = deletePost.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/admin/blog" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← All posts</Link>
        <div className="flex items-center gap-3">
          {post.published ? (
            <Link href={`/blog/${post.slug}`} target="_blank" className="text-[11px] tracking-[0.22em] uppercase font-bold underline hover:text-accent">View live →</Link>
          ) : null}
          <form action={remove}>
            <button className="text-[11px] tracking-[0.22em] uppercase font-bold text-red-600 hover:text-red-800">Delete</button>
          </form>
        </div>
      </div>
      <h1 className="font-display font-black text-3xl uppercase tracking-tightest mt-3 mb-6">Edit Post</h1>
      <PostForm action={update} post={post} submitLabel="Save changes" />
    </div>
  );
}
