import { NextResponse, type NextRequest } from "next/server";

// Canonical apex. Derived from NEXT_PUBLIC_SITE_URL when set (inlined at build
// time) so a deploy on a new host canonicalises to itself rather than bouncing
// traffic at a domain that may not point here yet. Falls back to the apex.
const CANONICAL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      return new URL(raw).hostname.toLowerCase();
    } catch {
      /* malformed env — fall through to the hard-coded apex */
    }
  }
  return "radnarsupply.com";
})();

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostNoPort = host.split(":")[0].toLowerCase();

  // 1. Canonicalise: any non-canonical custom domain (e.g. radnarsupply.co.uk,
  //    www.radnarsupply.com) → 301 to https://<canonical><path>
  //    Platform preview hosts are left untouched so previews keep working —
  //    without this a *.vercel.app deploy 301s every request off-site, and the
  //    301 is cached permanently by the visitor's browser.
  const isCanonical   = hostNoPort === CANONICAL;
  const isPreviewHost = hostNoPort.endsWith(".vercel.app")
    || hostNoPort.endsWith(".replit.app")
    || hostNoPort.endsWith(".repl.co")
    || hostNoPort.endsWith(".trycloudflare.com")
    || hostNoPort.endsWith(".ngrok-free.app");
  const isLocalhost   = hostNoPort === "localhost" || hostNoPort.startsWith("127.") || hostNoPort.endsWith(".local");

  if (!isCanonical && !isPreviewHost && !isLocalhost) {
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

// Run on all routes EXCEPT static assets, _next, and machine-to-machine API
// endpoints. Webhooks and cron must hit whatever host they were configured with
// without being redirected mid-request — curl and Stripe do not follow the
// canonical 301, so a redirect here is a silent no-op for them.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|api/cron|radnar-mark|radnar-mark-light).*)",
  ],
};
