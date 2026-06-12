import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { db } from "./prisma";
import { createSession, getSession } from "./session";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUp(input: { email: string; password: string; name?: string }) {
  const { email, password } = credentialsSchema.parse(input);
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email already in use");
  const user = await db.user.create({
    data: {
      email, name: input.name ?? null,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  await createSession(user.id);
  return user;
}

export async function signIn(input: { email: string; password: string }) {
  const { email, password } = credentialsSchema.parse(input);
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  await createSession(user.id);
  return user;
}

export async function requireUser() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.user;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (s.user.role !== "ADMIN") redirect("/admin/login");
  return s.user;
}

export async function createPasswordResetToken(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null; // don't reveal existence
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  await db.verificationToken.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h
    },
  });
  return { raw, user };
}

export async function consumePasswordResetToken(raw: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const t = await db.verificationToken.findUnique({ where: { tokenHash } });
  if (!t || t.consumedAt || t.expiresAt < new Date() || t.type !== "PASSWORD_RESET") {
    throw new Error("Token invalid or expired");
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await db.$transaction([
    db.user.update({ where: { id: t.userId }, data: { passwordHash: hash } }),
    db.verificationToken.update({ where: { id: t.id }, data: { consumedAt: new Date() } }),
  ]);
}
