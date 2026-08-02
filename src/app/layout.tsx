import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Inter_Tight } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const display = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://radnarsupply.com"),
  title: { default: "RADNAR SUPPLY — Source. Supply. Personal Shop.", template: "%s · Radnar Supply" },
  description: "Premium fashion, footwear, fragrance and luxury goods — buy in-stock or have it sourced for you. UK sourcing & supply with a personal shopping service.",
  openGraph: { type: "website", siteName: "Radnar Supply" },
};

/**
 * Resolve and apply the theme before first paint.
 *
 * This has to run as a blocking inline script: React cannot read localStorage
 * on the server, so any theme decision made in a component happens after the
 * browser has already painted, producing a visible flash of the wrong palette.
 *
 * Precedence: an explicit stored choice wins everywhere. Otherwise the default
 * depends on the surface — the storefront reads light (it is a shop, and the
 * imagery is shot on warm paper), the admin reads dark (the night-atelier
 * canvas it was designed for). System preference breaks the tie on the
 * storefront only.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('rs-theme');
    var isAdmin = location.pathname.indexOf('/admin') === 0;
    var theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else if (isAdmin) {
      theme = 'dark';
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans">
        {children}
        {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
      </body>
    </html>
  );
}
