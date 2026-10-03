import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { productionUrl } from "@/lib/constants";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  ...(productionUrl ? { metadataBase: new URL(productionUrl) } : {}),
  title: { default: "NetFold — Settle the difference", template: "%s · NetFold" },
  description:
    "NetFold compresses mutually approved USDG obligations into fully covered net settlements on Arbitrum.",
  applicationName: "NetFold",
  keywords: ["Arbitrum", "USDG", "stablecoin clearing", "net settlement"],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    title: "NetFold — Settle the difference, not every obligation",
    description: "200 USDG gross obligations. 60 USDG net liquidity. 70% compression on Arbitrum Sepolia.",
    siteName: "NetFold",
  },
  twitter: {
    card: "summary",
    title: "NetFold — Settle the difference, not every obligation",
    description: "A covered USDG clearing workspace on Arbitrum.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
