import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Providers } from "@/components/providers";
import { RegisterSw } from "@/components/register-sw";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vaibhav Kashi Foods | Order Food Online in Varanasi",
    template: "%s | Vaibhav Kashi Foods",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Vaibhav Kashi Foods",
    "Varanasi restaurant",
    "vegetarian food Varanasi",
    "North Indian thali",
    "order food online Varanasi",
    "SHEPA College food",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: SITE.name,
    title: "Vaibhav Kashi Foods | Order Food Online in Varanasi",
    description: SITE.description,
    images: [{ url: "/images/hero/hero.png", width: 1200, height: 630, alt: "Vaibhav Kashi Foods thali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhav Kashi Foods | Order Food Online in Varanasi",
    description: SITE.description,
    images: ["/images/hero/hero.png"],
  },
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/icons/icon-192.png",
    apple: "/images/icons/icon-192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6B2D1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    image: `${siteUrl}/images/hero/hero.png`,
    telephone: SITE.phone,
    servesCuisine: SITE.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.pincode,
      addressCountry: "IN",
    },
    url: siteUrl,
    menu: `${siteUrl}/menu`,
    acceptsReservations: "False",
    hasMenu: `${siteUrl}/menu`,
  };

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen paper-grid antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <RegisterSw />
          {children}
        </Providers>
      </body>
    </html>
  );
}
