export const money = (cents: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");
