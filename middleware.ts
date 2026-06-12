import { NextResponse, type NextRequest } from "next/server";

// Cheap edge guard — full role check happens in admin layout (RSC, has DB access).
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith("/admin") && p !== "/admin/login") {
    if (!req.cookies.get("rs_session")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  if (p.startsWith("/account")) {
    if (!req.cookies.get("rs_session")) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(p)}`, req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
