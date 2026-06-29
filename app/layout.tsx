import type { Metadata } from "next";
import { AdSenseAutoAds } from "@/components/AdSenseAutoAds";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { canonicalUrl, siteProfile } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "배터리 특허 검색 데이터룸 | 특허고고",
    template: "%s | 특허고고"
  },
  description: siteProfile.description,
  metadataBase: new URL(canonicalUrl("/")),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml"
    }
  },
  verification: {
    google: siteProfile.googleSiteVerification,
    other: siteProfile.naverSiteVerification ? { "naver-site-verification": siteProfile.naverSiteVerification } : undefined
  },
  openGraph: {
    type: "website",
    siteName: siteProfile.name,
    title: "배터리 특허 검색 데이터룸 | 특허고고",
    description: siteProfile.description,
    url: canonicalUrl("/"),
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "특허고고 배터리 특허 검색과 특허맵 데이터룸" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "배터리 특허 검색 데이터룸 | 특허고고",
    description: siteProfile.description,
    images: ["/og-image.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": canonicalUrl("/#organization"),
      name: siteProfile.name,
      url: canonicalUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: canonicalUrl("/og-image.png"),
        width: 1200,
        height: 630
      },
      email: siteProfile.contactEmail,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteProfile.contactEmail,
        availableLanguage: ["ko-KR", "en"]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": canonicalUrl("/#website"),
      name: siteProfile.name,
      url: canonicalUrl("/"),
      description: siteProfile.description,
      publisher: { "@id": canonicalUrl("/#organization") },
      inLanguage: "ko-KR"
    }
  ];

  return (
    <html lang="ko">
      <body>
        <JsonLd data={siteSchema} />
        {children}
        <SiteFooter />
        <GoogleAnalytics measurementId={siteProfile.gaMeasurementId} />
        <AdSenseAutoAds publisherId={siteProfile.adsensePublisherId} />
      </body>
    </html>
  );
}
