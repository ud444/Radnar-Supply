"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const SECTIONS: { label: string; items: { href: string; label: string; icon: keyof typeof Icon }[] }[] = [
  {
    label: "Operate",
    items: [
      { href: "/admin",          label: "Dashboard", icon: "dashboard" },
      { href: "/admin/orders",   label: "Orders",    icon: "bag" },
      { href: "/admin/requests", label: "Requests",  icon: "inbox" },
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
    label: "Content",
    items: [
      { href: "/admin/content", label: "Content & Media", icon: "image" },
      { href: "/admin/blog",    label: "Blog",            icon: "file" },
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
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  // Close drawer on navigation; lock body scroll while open
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const Nav = (
    <nav className="flex-1 py-4 overflow-y-auto">
      {SECTIONS.map((s) => (
        <div key={s.label} className="px-3 mb-5">
          <div className="px-2 mb-2 text-[10px] tracking-[0.22em] uppercase font-bold text-paper/40">{s.label}</div>
          {s.items.map((it) => {
            const I = Icon[it.icon];
            const active = isActive(it.href);
            return (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-2 py-2.5 text-sm transition-colors ${active ? "bg-paper/10 text-paper" : "text-paper/70 hover:text-paper hover:bg-paper/5"}`}>
                <I className={active ? "text-accent" : "text-paper/55"} />
                <span>{it.label}</span>
                {active ? <span className="ml-auto w-1 h-4 bg-accent" /> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const Footer = (
    <div className="border-t border-paper/15 p-4">
      <Link href="/" target="_blank" className="text-[11px] tracking-[0.22em] uppercase font-bold text-paper/55 hover:text-paper">View Store →</Link>
      <form action="/api/auth/logout" method="post" className="mt-3">
        <button className="text-[11px] tracking-[0.22em] uppercase font-bold text-paper/55 hover:text-accent">Sign Out</button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-ink text-paper px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/radnar-mark-light.png" alt="Radnar" width={1600} height={593} className="h-5 w-auto" />
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55">Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="inline-flex flex-col gap-[5px] p-2 -mr-2">
          <span className="block w-6 h-[2px] bg-paper" />
          <span className="block w-6 h-[2px] bg-paper" />
          <span className="block w-6 h-[2px] bg-paper" />
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 anim-fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-xs bg-ink text-paper flex flex-col anim-slide-in-left">
            <div className="px-5 pt-5 pb-4 border-b border-paper/15 flex items-center justify-between">
              <Image src="/radnar-mark-light.png" alt="Radnar" width={1600} height={593} className="h-6 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-paper/70 hover:text-paper p-2 -mr-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18 18 6" /></svg>
              </button>
            </div>
            {Nav}
            {Footer}
          </aside>
        </div>
      ) : null}

      {/* Desktop static sidebar */}
      <aside className="hidden md:flex w-60 bg-ink text-paper border-r border-ink flex-col">
        <div className="px-5 pt-6 pb-5 border-b border-paper/15">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/radnar-mark-light.png" alt="Radnar" width={1600} height={593} className="h-6 w-auto" />
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-paper/55">Admin</span>
          </Link>
        </div>
        {Nav}
        {Footer}
      </aside>
    </>
  );
}
