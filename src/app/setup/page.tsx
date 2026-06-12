import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function Setup() {
  // Self-disable: once any admin exists, this page is gone.
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) redirect("/admin/login");

  return (
    <div className="min-h-screen grid place-items-center bg-soft px-5">
      <div className="w-full max-w-md bg-white border border-line rounded p-8">
        <div className="text-[11px] tracking-[0.22em] uppercase text-muted">Radnar Supply</div>
        <h1 className="mt-2 text-2xl font-display font-semibold tracking-tightest">First-time setup</h1>
        <p className="text-sm text-muted mt-2">Create the first admin account. This page disappears once an admin exists.</p>
        <SetupForm />
      </div>
    </div>
  );
}
