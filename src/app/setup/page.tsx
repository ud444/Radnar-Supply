import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function Setup() {
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) redirect("/admin/login");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink text-paper">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-paper/15">
        <Image src="/radnar-mark-light.png" alt="Radnar Supply" width={1600} height={593} className="h-9 w-auto" />

        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-accent">First-Time Setup</div>
          <h1 className="mt-3 font-display font-black text-6xl uppercase display-tight">
            Spin up<br/>
            the store.
          </h1>
          <p className="mt-5 max-w-sm text-paper/70 text-sm leading-relaxed">
            Create the first admin account. This page disappears once an admin exists — a one-shot ticket into your own back office.
          </p>
        </div>

        <ol className="space-y-3 text-[12px]">
          {[
            { n: "01", h: "Create the admin",       p: "Strong password. You can change it later in /account/security." },
            { n: "02", h: "Sign in to /admin",      p: "You'll land in the dashboard." },
            { n: "03", h: "Add products + brands",  p: "Upload imagery via UploadThing, set stock per size." },
          ].map((s) => (
            <li key={s.n} className="border-l-2 border-accent pl-3">
              <div className="font-display font-black text-base uppercase tracking-tight">{s.n} · {s.h}</div>
              <div className="text-paper/65 text-[12px] mt-0.5">{s.p}</div>
            </li>
          ))}
        </ol>

        <div aria-hidden className="absolute -right-12 -bottom-16 text-paper/[0.04] font-display font-black text-[20rem] leading-none pointer-events-none select-none">RS</div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-paper text-ink p-8 md:p-10">
          <div className="lg:hidden mb-6 inline-flex items-center gap-2">
            <Image src="/radnar-mark.png" alt="Radnar Supply" width={1600} height={535} className="h-7 w-auto" />
          </div>
          <div className="eyebrow-lead">First-Time Setup</div>
          <h1 className="mt-3 font-display font-black text-4xl md:text-5xl uppercase display-tight">Create admin.</h1>
          <p className="mt-3 text-sm text-ink/65">This will create the first admin account. Once you submit, the setup page is permanently disabled.</p>
          <SetupForm />
        </div>
      </main>
    </div>
  );
}
