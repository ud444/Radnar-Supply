"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Icon } from "./icons";

/**
 * The rail sits one step BELOW the canvas rather than above it — on a dark UI a
 * recessed navigation edge reads as structure, where a lighter panel would
 * compete with the content for attention.
 */
const RAIL = "bg-[#0A0B0D]";

const SECTIONS: { label: string; items: { href: string; label: string; icon: keyof typeof Icon }[] }[] = [
  {
    label: "Operate",
    items: [
      { href: "/admin",          label: "Dashboard", icon: "dashboard" },
      { href: "/admin/orders",   label: "Orders",    icon: "bag" },
      { href: "/admin/requests", label: "Requests",  icon: "inbox" },
      { href: "/admin/reviews",  label: "Reviews",   icon: "file" },
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
      { href: "/admin/content",   label: "Content & media", icon: "image" },
      { href: "/admin/pages",     label: "Pages",           icon: "file" },
      { href: "/admin/blog",      label: "Blog",            icon: "file" },
      { href: "/admin/broadcast", label: "Broadcast",       icon: "inbox" },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/users",    label: "Customers", icon: "users" },
      { href: "/admin/api-keys", label: "API keys",  icon: "settings" },
      { href: "/admin/settings", label: "Settings",  icon: "settings" },
    ],
  },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : !!pathname?.startsWith(href);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const Nav = (
    <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
      {SECTIONS.map((s) => (
        <div key={s.label} className="px-3 mb-5 last:mb-2">
          <div className="px-3 mb-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold text-muted/70">
            {s.label}
          </div>
          <div className="space-y-0.5">
            {s.items.map((it) => {
              const I = Icon[it.icon];
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "relative flex items-center gap-3 px-3 h-9 rounded-[8px] text-[13px] transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                    active
                      // Raised surface + a lit top edge: the active item reads as
                      // physically closer than the rail behind it.
                      ? "bg-cream text-ink font-medium shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]"
                      : "text-muted hover:text-ink hover:bg-bone/70",
                  )}
                >
                  {active ? (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-accent shadow-[0_0_8px_rgb(255_77_0/0.7)]" />
                  ) : null}
                  <I className={active ? "text-accent" : "text-muted/70"} />
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Account = (
    <div className="border-t border-line p-3">
      {email ? (
        <div className="px-3 pt-1 pb-2.5">
          <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted/70">Signed in</div>
          <div className="mt-1 text-[12px] text-ink/85 truncate" title={email}>{email}</div>
        </div>
      ) : null}
      <Link
        href="/"
        target="_blank"
        className="flex items-center justify-between px-3 h-8 rounded-[8px] text-[12px] text-muted hover:text-ink hover:bg-bone/70 transition-colors"
      >
        View store <span aria-hidden>↗</span>
      </Link>
      <form action="/api/auth/logout" method="post">
        <button className="w-full text-left px-3 h-8 rounded-[8px] text-[12px] text-muted hover:text-accent hover:bg-bone/70 transition-colors">
          Sign out
        </button>
      </form>
    </div>
  );

  const Brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <Image src="/radnar-mark-light.png" alt="Radnar" width={1600} height={593} className="h-5 w-auto" />
      <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted/70">Admin</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className={clsx("md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-line", RAIL)}>
        {Brand}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex flex-col gap-[5px] p-2 -mr-2 rounded-[8px] hover:bg-bone transition-colors"
        >
          <span className="block w-5 h-[2px] rounded-full bg-ink" />
          <span className="block w-5 h-[2px] rounded-full bg-ink" />
          <span className="block w-5 h-[2px] rounded-full bg-ink" />
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 anim-fade-in" onClick={() => setOpen(false)} />
          <aside className={clsx("absolute left-0 top-0 bottom-0 w-[82vw] max-w-xs flex flex-col anim-slide-in-left lift-2", RAIL)}>
            <div className="px-5 pt-5 pb-4 border-b border-line flex items-center justify-between">
              {Brand}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-muted hover:text-ink p-2 -mr-2 rounded-[8px] hover:bg-bone transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 6l12 12M6 18 18 6" />
                </svg>
              </button>
            </div>
            {Nav}
            {Account}
          </aside>
        </div>
      ) : null}

      {/* Desktop static rail */}
      <aside className={clsx("hidden md:flex w-60 shrink-0 flex-col sticky top-0 h-screen border-r border-line", RAIL)}>
        <div className="px-5 pt-6 pb-5 border-b border-line">{Brand}</div>
        {Nav}
        {Account}
      </aside>
    </>
  );
}
