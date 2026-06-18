export const siteUrl = () => {
  const u = process.env.NEXT_PUBLIC_SITE_URL;
  if (!u) throw new Error("NEXT_PUBLIC_SITE_URL missing");
  return u.replace(/\/$/, "");
};
