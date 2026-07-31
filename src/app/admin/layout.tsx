import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  // x-pathname is set by middleware. x-invoke-path is a legacy fallback — Next
  // stopped setting it, which previously made every /admin/login render look
  // like a gated page and redirect to itself in a loop.
  const path = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "";
  const isLogin = path === "/admin/login" || path.endsWith("/admin/login");

  let email: string | null = null;
  if (!isLogin) {
    const s = await getSession();
    if (!s) redirect("/admin/login");
    if (s.user.role !== "ADMIN") redirect("/admin/login");
    email = s.user.email;
  }

  // The login page renders bare — no chrome to sign out of.
  if (isLogin) return <div className="min-h-screen bg-paper text-ink font-sans">{children}</div>;

  return (
    <div className="min-h-screen md:flex bg-paper text-ink font-sans">
      <AdminSidebar email={email} />
      <div className="flex-1 min-w-0">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10 max-w-[1440px]">{children}</div>
      </div>
    </div>
  );
}
