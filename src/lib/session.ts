import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./prisma";

export const SESSION_COOKIE = "rs_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_DAYS);
  await db.session.create({ data: { id, userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, id, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
  return id;
}

export async function getSession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const s = await db.session.findUnique({ where: { id }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return s;
}

export async function destroySession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (id) await db.session.delete({ where: { id } }).catch(() => {});
  (await cookies()).delete(SESSION_COOKIE);
}
