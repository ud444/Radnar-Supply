"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { sendWelcome } from "@/lib/email";

export type FormState = { error?: string } | null;

export async function setupAdmin(_: FormState, fd: FormData): Promise<FormState> {
  try {
    // Re-check: if any admin already exists, refuse.
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) return { error: "Setup already complete. Sign in instead." };

    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));
    const name = String(fd.get("name"));
    if (!email || password.length < 8) return { error: "Email and 8+ character password required" };

    const existing = await db.user.findUnique({ where: { email } });
    const user = existing
      ? await db.user.update({ where: { email }, data: { role: "ADMIN", name, passwordHash: await bcrypt.hash(password, 12) } })
      : await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });

    await createSession(user.id);
    sendWelcome(user.email, user.name).catch(() => {});
  } catch (e: any) {
    return { error: e.message ?? "Could not complete setup" };
  }
  redirect("/admin");
}
