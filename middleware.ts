import { NextResponse, type NextRequest } from "next/server";

// Canonical apex (set in code so we don't need an env round-trip)
const CANONICAL = "radnarsupply.com";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostNoPort = host.split(":")[0].toLowerCase();

  // 1. Canonicalise: any non-canonical custom domain (e.g. radnarsupply.co.uk,
  //    www.radnarsupply.com) → 301 to https://radnarsupply.com<path>
  //    Leaves .replit.app preview untouched so previews keep working.
  const isCanonical   = hostNoPort === CANONICAL;
  const isReplitPreview = hostNoPort.endsWith(".replit.app") || hostNoPort.endsWith(".repl.co");
  const isLocalhost   = hostNoPort === "localhost" || hostNoPort.startsWith("127.") || hostNoPort.endsWith(".local");

  if (!isCanonical && !isReplitPreview && !isLocalhost) {
    const url = new URL(req.nextUrl);
    url.host = CANONICAL;
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // 2. Auth gates (unchanged)
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

// Run on all routes EXCEPT static assets, _next, and API webhooks
// (webhooks must hit whatever host they were configured with — typically the
// .replit.app URL — without being redirected mid-request).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|radnar-mark|radnar-mark-light).*)",
  ],
};
