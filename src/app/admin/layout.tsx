import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/Sidebar";

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
    <div className="min-h-screen md:flex bg-paper text-ink font-sans">
      {!isLogin && <AdminSidebar />}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="p-4 sm:p-6 md:p-10 max-w-[1400px]">{children}</div>
      </div>
    </div>
  );
}
