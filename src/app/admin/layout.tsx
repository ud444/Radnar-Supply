import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

const NAV = [
  { href: "/admin",            label: "Dashboard" },
  { href: "/admin/orders",     label: "Orders" },
  { href: "/admin/products",   label: "Products" },
  { href: "/admin/brands",     label: "Brands" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/users",      label: "Users" },
  { href: "/admin/settings",   label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const path = h.get("x-invoke-path") ?? "";
  const isLogin = path.endsWith("/admin/login");

  if (!isLogin) {
    const s = await getSession();
    if (!s) redirect("/admin/login");
    if (s.user.role !== "ADMIN") redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-soft">
      {!isLogin && (
        <aside className="w-60 bg-white border-r border-line p-5 flex flex-col gap-1 text-sm">
          <div className="font-display font-semibold text-base mb-6 tracking-tightest">Radnar · Admin</div>
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 rounded hover:bg-soft">{l.label}</Link>
          ))}
          <form action="/api/auth/logout" method="post" className="mt-auto pt-4">
            <button className="text-xs text-muted hover:text-ink">Sign out</button>
          </form>
        </aside>
      )}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
