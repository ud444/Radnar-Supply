"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { PAGE_SLUGS, type PageSlug, type PageContent } from "@/lib/pages";

const MAX_SECTIONS = 14;

function isSlug(s: string): s is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(s);
}

export async function savePage(slug: string, fd: FormData) {
  await requireAdmin();
  if (!isSlug(slug)) throw new Error("Unknown page");
  const s = (k: string) => String(fd.get(k) ?? "").trim();

  const sections: PageContent["sections"] = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const h = s(`sec_h_${i}`);
    const body = s(`sec_b_${i}`);
    if (h || body) sections.push({ h, body });
  }

  const content: PageContent = {
    eyebrow: s("eyebrow"),
    title: s("title"),
    intro: s("intro"),
    updated: s("updated"),
    sections,
  };

  await setSetting(`page.${slug}`, content);
  revalidatePath(`/policies/${slug}`);
  revalidatePath(`/admin/pages/${slug}`);
  revalidatePath("/admin/pages");
}
