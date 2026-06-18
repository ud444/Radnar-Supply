import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createPost } from "../actions";
import { PostForm } from "../PostForm";

export default async function NewPost() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/blog" className="text-[11px] tracking-[0.22em] uppercase font-bold text-ink/55 hover:text-accent">← All posts</Link>
      <h1 className="font-display font-black text-3xl uppercase tracking-tightest mt-3 mb-6">New Post</h1>
      <PostForm action={createPost} submitLabel="Create post" />
    </div>
  );
}
