"use server";
import { redirect } from "next/navigation";
import { signIn, signUp, createPasswordResetToken, consumePasswordResetToken } from "@/lib/auth";
import { destroySession } from "@/lib/session";
import { sendPasswordReset, sendWelcome } from "@/lib/email";
import { siteUrl } from "@/lib/url";

export type FormState = { error?: string } | null;

export async function signInAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    await signIn({ email: String(fd.get("email")), password: String(fd.get("password")) });
  } catch (e: any) { return { error: e.message ?? "Invalid credentials" }; }
  redirect(String(fd.get("next") || "/account"));
}

export async function signUpAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      name: fd.get("name") ? String(fd.get("name")) : undefined,
    });
    sendWelcome(user.email, user.name).catch(() => {});
  } catch (e: any) { return { error: e.message ?? "Could not create account" }; }
  redirect("/account");
}

export async function forgotAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email"));
  const result = await createPasswordResetToken(email);
  if (result) {
    const link = `${siteUrl()}/reset/${result.raw}`;
    sendPasswordReset(email, link).catch((e) => console.error(e));
  }
  return { error: undefined };
}

export async function resetAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    await consumePasswordResetToken(String(fd.get("token")), String(fd.get("password")));
  } catch (e: any) { return { error: e.message ?? "Could not reset" }; }
  redirect("/login?reset=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
