"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const SECTIONS: { label: string; items: { href: string; label: string; icon: keyof typeof Icon }[] }[] = [
  {
    label: "Operate",
    items: [
      { href: "/admin",        label: "Dashboard", icon: "dashboard" },
      { href: "/admin/orders", label: "Orders",    icon: "bag" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products",   label: "Products",   icon: "tag" },
      { href: "/admin/brands",     label: "Brands",     icon: "layers" },
      { href: "/admin/categories", label: "Categories", icon: "list" },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/users",    label: "Customers", icon: "users" },
      { href: "/admin/api-keys", label: "API Keys",  icon: "settings" },
      { href: "/admin/settings", label: "Settings",  icon: "settings" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <aside className="w-60 bg-ink text-paper border-r border-ink flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-paper/15">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/radnar-mark-light.png" alt="Radnar" width={1600} height={593} className="h-6 w-auto" />
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {SECTIONS.map((s) => (
          <div key={s.label} className="px-3 mb-5">
            <div className="px-2 mb-2 text-[10px] tracking-[0.22em] uppercase font-bold text-paper/40">{s.label}</div>
            {s.items.map((it) => {
              const I = Icon[it.icon];
              const active = isActive(it.href);
              return (
                <Link key={it.href} href={it.href}
                  className={`flex items-center gap-3 px-2 py-2 text-sm transition-colors ${active ? "bg-paper/10 text-paper" : "text-paper/70 hover:text-paper hover:bg-paper/5"}`}>
                  <I className={active ? "text-accent" : "text-paper/55"} />
                  <span>{it.label}</span>
                  {active ? <span className="ml-auto w-1 h-4 bg-accent" /> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-paper/15 p-4">
        <Link href="/" target="_blank" className="text-[11px] tracking-[0.22em] uppercase font-bold text-paper/55 hover:text-paper">View Store →</Link>
        <form action="/api/auth/logout" method="post" className="mt-3">
          <button className="text-[11px] tracking-[0.22em] uppercase font-bold text-paper/55 hover:text-accent">Sign Out</button>
        </form>
      </div>
    </aside>
  );
}
