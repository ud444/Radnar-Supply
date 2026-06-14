"use server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { destroySession, createSession } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean } | null;

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next    = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (next !== confirm) return { error: "Passwords don't match" };
  if (next.length < 8) return { error: "Password must be at least 8 characters" };

  const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!fresh.passwordHash || !(await bcrypt.compare(current, fresh.passwordHash))) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(next, 12);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  // Revoke all sessions on other devices, keep the current one
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);

  return { ok: true };
}
