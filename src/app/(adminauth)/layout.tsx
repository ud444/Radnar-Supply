/**
 * Layout for admin routes that must NOT be behind the admin auth gate.
 *
 * /admin/login lives here rather than under app/admin/ because a nested layout
 * cannot opt out of its parent. When the login page sat inside app/admin/, the
 * gated layout ran on it, found no session, and redirected to /admin/login —
 * itself — producing an infinite 307. Detecting the pathname from headers to
 * special-case it proved unreliable, so the route is separated structurally
 * instead. A route group changes the tree without changing the URL.
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink text-paper font-sans">{children}</div>;
}
