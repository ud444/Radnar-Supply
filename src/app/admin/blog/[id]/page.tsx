import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { updatePost, deletePost } from "../actions";
import { PostForm } from "../PostForm";
import { PageHeader, Button } from "@/components/admin/ui";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  const update = updatePost.bind(null, id);
  const remove = deletePost.bind(null, id);

  return (
    <div>
      <Link href="/admin/blog" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All posts
      </Link>

      <PageHeader
        eyebrow="Content"
        title="Edit post"
        description={post.title}
        actions={
          <>
            {post.published ? (
              <Link
                href={`/blog/${post.slug}`} target="_blank"
                className="text-[13px] text-muted hover:text-ink transition-colors"
              >
                View live →
              </Link>
            ) : null}
            <form action={remove}>
              <Button variant="danger" size="md">Delete</Button>
            </form>
          </>
        }
      />

      <PostForm action={update} post={post} submitLabel="Save changes" />
    </div>
  );
}
