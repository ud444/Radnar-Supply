"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type FormState = { error?: string } | null;

export async function adminLoginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email")).trim().toLowerCase();
  const password = String(fd.get("password"));
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || user.role !== "ADMIN" || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid admin credentials" };
  }
  await createSession(user.id);
  redirect("/admin");
}
