"use client";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import {
  Card, Button, Field, TextareaField, Checkbox, Eyebrow, Label,
} from "@/components/admin/ui";

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

      <Card className="space-y-4">
        <Field label="Title" name="title" defaultValue={post?.title ?? ""} required />
        <Field
          label="Slug" hint="generated from the title if left blank"
          name="slug" defaultValue={post?.slug ?? ""}
        />
        <TextareaField
          label="Excerpt" hint="shown on the blog index"
          name="excerpt" defaultValue={post?.excerpt ?? ""} rows={2}
        />
      </Card>

      <Card>
        <Label>Cover image</Label>
        {cover ? (
          <div className="relative w-full max-w-sm aspect-[16/9] rounded-control bg-cream overflow-hidden mb-3 border border-line/70">
            {/* Uploaded to UploadThing from the browser — no intrinsic size known here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <UploadButton
            endpoint="contentImage"
            onClientUploadComplete={(files) => {
              const f = files[0] as any;
              setCover(f?.ufsUrl ?? f?.url ?? "");
              setCoverKey(f?.key ?? "");
            }}
            onUploadError={(e) => setErr((e as any).message)}
            appearance={{
              button: "h-8 px-3 rounded-control bg-ink text-paper text-[12px] font-medium hover:bg-accent transition-colors",
              allowedContent: "hidden",
            }}
            content={{ button: cover ? "Replace" : "Upload" }}
          />
          {cover ? (
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => { setCover(""); setCoverKey(""); }}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {err ? <div className="text-[12px] text-danger mt-2">{err}</div> : null}
      </Card>

      <Card>
        <TextareaField
          label="Body"
          hint="blank line starts a paragraph; a line starting with ## becomes a heading"
          name="body" defaultValue={post?.body ?? ""} rows={16} required
          className="font-mono text-[13px]"
        />
      </Card>

      <Card className="space-y-4">
        <Eyebrow>SEO — optional</Eyebrow>
        <Field label="Meta title" name="metaTitle" defaultValue={post?.metaTitle ?? ""} />
        <TextareaField
          label="Meta description" name="metaDescription"
          defaultValue={post?.metaDescription ?? ""} rows={2}
        />
      </Card>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Checkbox
          label="Published — visible on the public blog"
          name="published" defaultChecked={post?.published ?? false}
        />
        <Button>{submitLabel}</Button>
      </div>
    </form>
  );
}
