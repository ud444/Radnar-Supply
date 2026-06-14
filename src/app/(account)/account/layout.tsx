import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { requireUser } from "@/lib/auth";

const SECTIONS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Account",
    items: [
      { href: "/account",           label: "Dashboard" },
      { href: "/account/orders",    label: "Orders" },
      { href: "/account/addresses", label: "Addresses" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/account/security", label: "Security" },
    ],
  },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-5 md:px-8 py-10 md:py-12 grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            {/* User card */}
            <div className="card-frame">
              <div className="num-mark mb-1">·</div>
              <div className="font-display font-black uppercase text-xl tracking-tight">{user.name ?? "Member"}</div>
              <div className="text-[11px] tracking-[0.04em] text-ink/65 mt-1 break-all">{user.email}</div>
            </div>

            {/* Sectioned nav */}
            <nav className="mt-6">
              {SECTIONS.map((s) => (
                <div key={s.label} className="mb-5">
                  <div className="eyebrow-lead mb-2">{s.label}</div>
                  <ul className="space-y-1">
                    {s.items.map((it) => (
                      <li key={it.href}>
                        <Link href={it.href} className="block py-1.5 text-sm hover:text-accent">
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <form action="/api/auth/logout" method="post" className="mt-6 pt-4 border-t border-ink/15">
                <button className="text-[11px] tracking-[0.18em] uppercase font-bold text-ink/55 hover:text-accent">
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </aside>

        <section className="md:col-span-9 min-w-0">{children}</section>
      </main>
      <Footer />
    </>
  );
}
