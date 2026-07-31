import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/Sidebar";

/**
 * Gated admin shell. Every route under app/admin/ is behind this.
 *
 * /admin/login deliberately does NOT live here — it sits in the (adminauth)
 * route group so it cannot inherit this gate. See that group's layout for why.
 * That means this layout can redirect unconditionally, with no pathname
 * sniffing and no loop.
 *
 * `admin-dark` scopes the night-atelier palette: every bg-bone / text-ink /
 * border-line below resolves to the dark surface set without the storefront
 * being touched.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (s.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="admin-dark min-h-screen md:flex bg-paper text-ink font-sans">
      <AdminSidebar email={s.user.email} />
      <div className="flex-1 min-w-0">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10 max-w-[1440px]">{children}</div>
      </div>
    </div>
  );
}
