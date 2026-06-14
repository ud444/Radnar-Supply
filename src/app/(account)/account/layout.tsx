import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-5 md:px-8 py-12 grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-3 text-sm">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">Account</div>
          <nav className="space-y-1.5">
            <Link href="/account" className="block py-1 hover:text-ink">Dashboard</Link>
            <Link href="/account/orders" className="block py-1 hover:text-ink">Orders</Link>
            <Link href="/account/addresses" className="block py-1 hover:text-ink">Addresses</Link>
            <Link href="/account/security" className="block py-1 hover:text-ink">Security</Link>
            <form action="/api/auth/logout" method="post"><button className="text-muted underline pt-2">Sign out</button></form>
          </nav>
        </aside>
        <section className="md:col-span-9">{children}</section>
      </main>
      <Footer />
    </>
  );
}
