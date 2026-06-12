import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const img = (s: string) => `https://picsum.photos/seed/${encodeURIComponent(s)}/900/1125`;

const BRANDS = [
  { slug: "atelier-9",    name: "Atelier 9" },
  { slug: "field-studios", name: "Field Studios" },
  { slug: "northline",    name: "Northline" },
  { slug: "tom-ford",     name: "Tom Ford" },
  { slug: "creed",        name: "Creed" },
  { slug: "halcyon",      name: "Halcyon" },
];

const CATEGORIES = [
  { slug: "clothing",    name: "Clothing" },
  { slug: "shoes",       name: "Shoes" },
  { slug: "accessories", name: "Accessories" },
  { slug: "fragrance",   name: "Fragrance" },
];

const PRODUCTS = [
  { slug: "essential-knit-hoodie-charcoal", name: "Essential Knit Hoodie — Charcoal", brand: "atelier-9",    cat: "clothing",    price: 14999, sizes: ["S","M","L","XL"], featured: true,  desc: "Heavyweight knit hoodie in charcoal. Garment-dyed for a soft, lived-in finish." },
  { slug: "low-runner-bone",                name: "Low Runner — Bone",                 brand: "field-studios", cat: "shoes",       price: 18900, sizes: ["7","8","9","10","11"], featured: true, desc: "Low-profile leather runner. Cushioned EVA midsole, rubber outsole." },
  { slug: "wide-leg-denim-indigo",          name: "Wide-Leg Denim — Indigo",           brand: "atelier-9",    cat: "clothing",    price: 11900, sizes: ["28","30","32","34","36"], desc: "Heavyweight selvedge denim, wide leg, mid-rise. Built to break in." },
  { slug: "boxy-tee-stone",                 name: "Boxy Tee — Stone",                   brand: "northline",    cat: "clothing",    price: 4900,  sizes: ["S","M","L","XL"], featured: true, desc: "240gsm boxy tee in stone. Drop shoulder, ribbed collar, garment washed." },
  { slug: "track-jacket-jet",               name: "Track Jacket — Jet",                 brand: "field-studios", cat: "clothing",    price: 9900,  sizes: ["S","M","L","XL"], desc: "Slim-cut track jacket in matte jet. Contrast tipping, zip front, side pockets." },
  { slug: "tom-ford-ombre-leather",         name: "Ombré Leather EDP 100ml",            brand: "tom-ford",     cat: "fragrance",   price: 16500, sizes: ["100ml"], featured: true, desc: "Smoke, jasmine, and patchouli over leather. Eau de parfum." },
  { slug: "creed-aventus-100ml",            name: "Aventus EDP 100ml",                  brand: "creed",        cat: "fragrance",   price: 22000, sizes: ["100ml"], desc: "Pineapple, birch, musk. The original." },
  { slug: "cashmere-crew-bone",             name: "Cashmere Crew — Bone",               brand: "atelier-9",    cat: "clothing",    price: 18500, sizes: ["XS","S","M","L"], featured: true, desc: "12-gauge Italian cashmere crewneck. Ribbed cuffs and hem." },
  { slug: "platform-loafer-noir",           name: "Platform Loafer — Noir",             brand: "field-studios", cat: "shoes",       price: 17900, sizes: ["36","37","38","39","40"], desc: "Sculpted platform loafer in box-leather. Chunky lug sole, hand-stitched apron." },
  { slug: "wool-overcoat-camel",            name: "Wool Overcoat — Camel",              brand: "northline",    cat: "clothing",    price: 24900, sizes: ["XS","S","M","L"], desc: "Single-breasted wool-blend overcoat. Notch lapel, welt pockets." },
  { slug: "satin-slip-skirt-noir",          name: "Satin Slip Skirt — Noir",            brand: "northline",    cat: "clothing",    price: 7900,  sizes: ["XS","S","M","L"], desc: "Bias-cut satin slip skirt. Mid-length, dry clean." },
  { slug: "high-runner-graphite",           name: "High Runner — Graphite",             brand: "field-studios", cat: "shoes",       price: 19900, sizes: ["36","37","38","39","40"], featured: true, desc: "High-top runner in suede and mesh, graphite. Padded collar, vulcanised outsole." },
  { slug: "leather-cap-noir",               name: "Leather Cap — Noir",                 brand: "halcyon",      cat: "accessories", price: 5900,  sizes: ["One Size"], desc: "Soft nappa-leather six-panel cap. Brass eyelets, adjustable back." },
  { slug: "card-holder-tobacco",            name: "Card Holder — Tobacco",              brand: "halcyon",      cat: "accessories", price: 4500,  sizes: ["One Size"], desc: "Slim full-grain leather card holder. Four cardslots and a centre pocket." },
  { slug: "halcyon-edp-50ml",               name: "Halcyon EDP 50ml",                   brand: "halcyon",      cat: "fragrance",   price: 8900,  sizes: ["50ml"], desc: "Vetiver, bergamot, smoked cedar. House signature." },
  { slug: "merino-beanie-charcoal",         name: "Merino Beanie — Charcoal",           brand: "northline",    cat: "accessories", price: 3500,  sizes: ["One Size"], desc: "Fine-knit merino beanie. Cuffed, lightweight, made in Portugal." },
];

async function main() {
  console.log("Seeding brands…");
  for (const b of BRANDS) await db.brand.upsert({ where: { slug: b.slug }, update: { name: b.name }, create: b });

  console.log("Seeding categories…");
  for (const c of CATEGORIES) await db.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });

  console.log("Seeding products…");
  for (const p of PRODUCTS) {
    const brand    = await db.brand.findUniqueOrThrow({ where: { slug: p.brand } });
    const category = await db.category.findUniqueOrThrow({ where: { slug: p.cat } });

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, description: p.desc, priceCents: p.price,
        brandId: brand.id, categoryId: category.id, featured: p.featured ?? false,
      },
      create: {
        slug: p.slug, name: p.name, description: p.desc, priceCents: p.price,
        brandId: brand.id, categoryId: category.id, featured: p.featured ?? false,
      },
    });

    // Images (3 each, placeholder)
    await db.productImage.deleteMany({ where: { productId: product.id, key: { startsWith: "seed:" } } });
    await db.productImage.createMany({
      data: [0, 1, 2].map((i) => ({
        productId: product.id, position: i, alt: p.name,
        key: `seed:${p.slug}-${i}`, url: img(`${p.slug}-${i}`),
      })),
    });

    // Variants
    for (const size of p.sizes) {
      const sku = `${p.slug}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
      await db.variant.upsert({
        where: { sku }, update: { stock: 8 },
        create: { productId: product.id, size, sku, stock: 8 },
      });
    }
  }

  console.log("Seeding default settings…");
  const defaults: Record<string, any> = {
    "shipping.flat_rate_pence":     495,
    "shipping.free_threshold_pence": 7500,
    "store.name":                   "Radnar Supply",
    "store.tagline":                "Verified designer. Always below retail.",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.setting.upsert({
      where: { key }, update: {}, create: { key, value: JSON.stringify(value) },
    });
  }

  console.log(`✓ ${BRANDS.length} brands, ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`);
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e); await db.$disconnect(); process.exit(1);
});
