"use client";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";

type Post = {
  title: string; slug: string; excerpt: string | null; body: string;
  coverImage: string | null; coverImageKey: string | null;
  metaTitle: string | null; metaDescription: string | null; published: boolean;
};

export function PostForm({
  action, post, submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  post?: Partial<Post>;
  submitLabel: string;
}) {
  const [cover, setCover] = useState(post?.coverImage ?? "");
  const [coverKey, setCoverKey] = useState(post?.coverImageKey ?? "");
  const [err, setErr] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <input type="hidden" name="coverImage" value={cover} />
      <input type="hidden" name="coverImageKey" value={coverKey} />

      <div className="bg-white border border-line p-6 space-y-4">
        <T label="Title" name="title" defaultValue={post?.title ?? ""} required />
        <T label="Slug (leave blank to auto-generate)" name="slug" defaultValue={post?.slug ?? ""} />
        <TA label="Excerpt (shown on the blog index)" name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2} />
      </div>

      <div className="bg-white border border-line p-6">
        <div className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold mb-2">Cover image</div>
        {cover ? (
          <div className="relative w-full max-w-sm aspect-[16/9] bg-soft overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <UploadButton
            endpoint="contentImage"
            onClientUploadComplete={(files) => {
              const f = files[0] as any;
              setCover(f?.ufsUrl ?? f?.url ?? "");
              setCoverKey(f?.key ?? "");
            }}
            onUploadError={(e) => setErr((e as any).message)}
            appearance={{ button: "bg-ink text-white px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase font-bold", allowedContent: "hidden" }}
            content={{ button: cover ? "Replace" : "Upload" }}
          />
          {cover ? (
            <button type="button" onClick={() => { setCover(""); setCoverKey(""); }} className="text-[11px] tracking-[0.16em] uppercase font-bold text-ink/45 hover:text-ink">Remove</button>
          ) : null}
        </div>
        {err ? <div className="text-xs text-red-600 mt-2">{err}</div> : null}
      </div>

      <div className="bg-white border border-line p-6">
        <TA label="Body — plain text. Blank line = new paragraph; a line starting with ## becomes a heading." name="body" defaultValue={post?.body ?? ""} rows={16} required />
      </div>

      <div className="bg-white border border-line p-6 space-y-4">
        <div className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold">SEO (optional)</div>
        <T label="Meta title" name="metaTitle" defaultValue={post?.metaTitle ?? ""} />
        <TA label="Meta description" name="metaDescription" defaultValue={post?.metaDescription ?? ""} rows={2} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
        <span>Published (visible on the public blog)</span>
      </label>

      <button className="bg-ink text-white py-3 text-sm font-medium px-8">{submitLabel}</button>
    </form>
  );
}

function T({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold">{label}</span>
      <input {...rest} className="mt-1 w-full border border-line px-3 py-2.5 text-sm" />
    </label>
  );
}
function TA({ label, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.16em] uppercase text-muted font-bold">{label}</span>
      <textarea {...rest} className="mt-1 w-full border border-line px-3 py-2.5 text-sm font-mono" />
    </label>
  );
}
