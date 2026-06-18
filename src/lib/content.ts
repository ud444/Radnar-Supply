import { getSetting } from "./settings";
import { IMG } from "./images";

/**
 * CMS-lite: the editable homepage content + media live in two Setting rows
 * ("home.content" and "home.media") as JSON. Everything falls back to the
 * defaults below, so the site renders fully even before anything is edited.
 */

export type WhyItem = { h: string; p: string };

export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;        // newlines become <br/>
  heroBody: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;

  personalEyebrow: string;
  personalTitle: string;
  personalBody: string;
  personalCtaLabel: string;

  privateEyebrow: string;
  privateTitle: string;
  privateBody: string;
  privateCtaLabel: string;

  whyTitle: string;
  whyItems: WhyItem[];
};

export type HomeMedia = {
  hero: string;
  editorial: string;
  personal: string;
  private: string;
  categoryClothing: string;
  categoryShoes: string;
  categoryAccessories: string;
  categoryFragrance: string;
};

export const DEFAULT_CONTENT: HomeContent = {
  heroEyebrow: "Source · Supply · Personal Shop",
  heroTitle: "Source.\nSupply.\nPersonal Shop.",
  heroBody:
    "Access premium fashion, luxury goods and exclusive sourcing through Radnar Supply — verified stock and a personal shopping service backed by our supplier network.",
  heroPrimaryLabel: "Shop Stock",
  heroPrimaryHref: "/shop",
  heroSecondaryLabel: "Request Sourcing",
  heroSecondaryHref: "/sourcing",

  personalEyebrow: "Personal Shopping",
  personalTitle: "Looking for\nsomething specific?",
  personalBody:
    "Our team sources products through our trusted network of suppliers and industry contacts. Tell us what you want — we track it down at the right price.",
  personalCtaLabel: "Start My Search",

  privateEyebrow: "Radnar Private",
  privateTitle: "Luxury,\nsourced discreetly.",
  privateBody:
    "For high-value designer goods sourced privately through our network. Enquiry only — handled with discretion from first contact to delivery.",
  privateCtaLabel: "Make A Private Enquiry",

  whyTitle: "Why Radnar.",
  whyItems: [
    { h: "UK Registered Business", p: "Radnar Supply Ltd — a registered UK company, Company No. 17263761. Accountable and contactable." },
    { h: "Secure Payments", p: "Checkout handled by Stripe. Cards, Apple Pay, Google Pay and Klarna — we never see your card details." },
    { h: "Dedicated Sourcing Network", p: "Trusted suppliers and industry contacts across Europe — the reach to find what you're after." },
    { h: "Personal Shopping Service", p: "Can't find it? We source it for you. No obligation, no payment until you approve an option." },
    { h: "Fast UK Dispatch", p: "In-stock orders ship the same working day from the UK. Tracked, with free 30-day returns." },
  ],
};

export const DEFAULT_MEDIA: HomeMedia = {
  hero: IMG.hero,
  editorial: IMG.editorial,
  personal: IMG.heroAlt,
  private: IMG.editorial,
  categoryClothing: IMG.category.clothing,
  categoryShoes: IMG.category.shoes,
  categoryAccessories: IMG.category.accessories,
  categoryFragrance: IMG.category.fragrance,
};

export async function getHomeContent(): Promise<HomeContent> {
  const stored = await getSetting<Partial<HomeContent>>("home.content", {});
  return {
    ...DEFAULT_CONTENT,
    ...stored,
    whyItems:
      Array.isArray(stored?.whyItems) && stored.whyItems.length > 0
        ? stored.whyItems
        : DEFAULT_CONTENT.whyItems,
  };
}

export async function getHomeMedia(): Promise<HomeMedia> {
  const stored = await getSetting<Partial<HomeMedia>>("home.media", {});
  return { ...DEFAULT_MEDIA, ...stored };
}

/** Category slug -> editable tile image, falling back to defaults. */
export function categoryImage(media: HomeMedia, slug: string): string {
  const map: Record<string, string> = {
    clothing: media.categoryClothing,
    shoes: media.categoryShoes,
    accessories: media.categoryAccessories,
    fragrance: media.categoryFragrance,
  };
  return map[slug] ?? IMG.heroAlt;
}
