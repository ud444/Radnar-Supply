import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://radnar.supply"),
  title: { default: "Radnar Supply — Verified Designer. Always Below Retail.", template: "%s · Radnar Supply" },
  description: "Hand-picked designer apparel, footwear, accessories, and fragrance. Verified. Always below retail. Birmingham, UK.",
  openGraph: { type: "website", siteName: "Radnar Supply" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-ink antialiased">
        {children}
        {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
      </body>
    </html>
  );
}
