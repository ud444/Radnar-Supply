/**
 * HARD RESET — wipes ALL store data for a fresh start.
 *
 * Deletes every row in every table (users, orders, products, brands,
 * categories, content, sourcing requests, etc.). Irreversible.
 *
 * Usage:
 *   npx tsx scripts/reset.ts          # DRY RUN — prints counts, deletes nothing
 *   npx tsx scripts/reset.ts --yes    # actually wipes everything
 *
 * Runs against whatever DATABASE_URL is set. To target the production DB
 * explicitly:  DATABASE_URL="<prod-url>" npx tsx scripts/reset.ts --yes
 *
 * After wiping, visit /setup to create the first admin again.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const CONFIRM = process.argv.includes("--yes");

async function main() {
  const counts = {
    users: await db.user.count(),
    orders: await db.order.count(),
    products: await db.product.count(),
    brands: await db.brand.count(),
    categories: await db.category.count(),
    sourcingRequests: await db.sourcingRequest.count(),
    posts: await db.post.count(),
  };
  const dbHost = (process.env.DATABASE_URL || "").replace(/^.*@/, "").replace(/\?.*$/, "");
  console.log(`Connected to: ${dbHost || "(DATABASE_URL not set)"}`);
  console.log("Current data:", counts);

  if (!CONFIRM) {
    console.log("\n⚠️  DRY RUN — nothing deleted.");
    console.log("If the counts above are your REAL data, re-run with --yes to wipe everything.");
    await db.$disconnect();
    return;
  }

  console.log("\nWiping everything…");
  // Children → parents to satisfy foreign keys.
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.stockNotice.deleteMany();
  await db.productImage.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.brand.deleteMany();
  await db.category.deleteMany();
  await db.webhook.deleteMany();
  await db.apiKey.deleteMany();
  await db.address.deleteMany();
  await db.session.deleteMany();
  await db.verificationToken.deleteMany();
  await db.sourcingRequest.deleteMany();
  await db.post.deleteMany();
  await db.setting.deleteMany();
  await db.user.deleteMany();

  console.log("✓ Database is empty. Visit /setup to create the first admin.");
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
