import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createPost } from "../actions";
import { PostForm } from "../PostForm";
import { PageHeader } from "@/components/admin/ui";

export default async function NewPost() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/blog" className="text-[13px] text-muted hover:text-ink transition-colors">
        ← All posts
      </Link>
      <PageHeader eyebrow="Content" title="New post" />
      <PostForm action={createPost} submitLabel="Create post" />
    </div>
  );
}
