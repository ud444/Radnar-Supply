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
  title: { default: "RADNAR SUPPLY — Verified Designer. Always Below Retail.", template: "%s · Radnar Supply" },
  description: "Hand-picked designer apparel, footwear, accessories, and fragrance. Verified. Always below retail. Birmingham, UK.",
  openGraph: { type: "website", siteName: "Radnar Supply" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans">
        {children}
        {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
      </body>
    </html>
  );
}
