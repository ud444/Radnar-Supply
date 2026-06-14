/**
 * One-shot admin password reset.
 *
 * Usage:
 *   npx tsx scripts/reset-admin.ts <email> <new_password>
 *
 * If the user doesn't exist it'll be created with role=ADMIN.
 * If it exists, the password is replaced and role is promoted to ADMIN.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/reset-admin.ts <email> <new_password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: "ADMIN" },
    create: { email: email.toLowerCase(), passwordHash, role: "ADMIN", name: "Admin" },
  });

  // Revoke existing sessions so old logins on stolen devices stop working
  await db.session.deleteMany({ where: { userId: user.id } });

  console.log(`✓ Reset password for ${user.email} (role: ${user.role}, sessions revoked)`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
