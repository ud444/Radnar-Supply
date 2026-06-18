"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { getHomeContent, getHomeMedia, type HomeMedia } from "@/lib/content";

const MEDIA_KEYS: (keyof HomeMedia)[] = [
  "hero", "editorial", "personal", "private",
  "categoryClothing", "categoryShoes", "categoryAccessories", "categoryFragrance",
];

export async function saveContent(fd: FormData) {
  await requireAdmin();
  const s = (k: string) => String(fd.get(k) ?? "").trim();

  // Up to 5 "why" items
  const whyItems = [];
  for (let i = 0; i < 5; i++) {
    const h = s(`why_h_${i}`);
    const p = s(`why_p_${i}`);
    if (h || p) whyItems.push({ h, p });
  }

  await setSetting("home.content", {
    heroEyebrow: s("heroEyebrow"),
    heroTitle: s("heroTitle"),
    heroBody: s("heroBody"),
    heroPrimaryLabel: s("heroPrimaryLabel"),
    heroPrimaryHref: s("heroPrimaryHref"),
    heroSecondaryLabel: s("heroSecondaryLabel"),
    heroSecondaryHref: s("heroSecondaryHref"),
    personalEyebrow: s("personalEyebrow"),
    personalTitle: s("personalTitle"),
    personalBody: s("personalBody"),
    personalCtaLabel: s("personalCtaLabel"),
    privateEyebrow: s("privateEyebrow"),
    privateTitle: s("privateTitle"),
    privateBody: s("privateBody"),
    privateCtaLabel: s("privateCtaLabel"),
    whyTitle: s("whyTitle"),
    whyItems,
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
}

/** Called by the client media manager after an UploadThing upload completes. */
export async function saveMediaImage(key: string, url: string) {
  await requireAdmin();
  if (!MEDIA_KEYS.includes(key as keyof HomeMedia)) throw new Error("Unknown media slot");
  const current = await getHomeMedia();
  await setSetting("home.media", { ...current, [key]: url });
  revalidatePath("/");
  revalidatePath("/admin/content");
}

/** Reset a single media slot back to its default image. */
export async function resetMediaImage(key: string) {
  await requireAdmin();
  if (!MEDIA_KEYS.includes(key as keyof HomeMedia)) throw new Error("Unknown media slot");
  const { DEFAULT_MEDIA } = await import("@/lib/content");
  const current = await getHomeMedia();
  await setSetting("home.media", { ...current, [key]: DEFAULT_MEDIA[key as keyof HomeMedia] });
  revalidatePath("/");
  revalidatePath("/admin/content");
}
