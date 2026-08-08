import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google"; 
import "./globals.css";
import { AOSInit } from "@/components/AOSInit";
import { Analytics } from "@vercel/analytics/react"; 
import { GoogleAnalytics } from "@next/third-parties/google"; 
import { NotificationProvider } from "@/context/NotificationContext";
import { BookingProvider } from "@/components/booking/BookingProvider";
import Script from "next/script";
import LegacyTokenCleanup from "@/components/LegacyTokenCleanup";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

// Setup Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// Setup Fraunces
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://usesiro.com'),
  title: "Siro | Tax Readiness & Automated Records for Nigerian Businesses",
  description: "Track income and expenses automatically, tag VAT, and generate clean NRS-compliant reports. Ditch the spreadsheets and keep your Nigerian business tax-ready.",
  alternates: {
    canonical: 'https://usesiro.com', 
  },
  keywords: [
    "Tax compliance Nigeria", 
    "Automated bookkeeping", 
    "VAT tagging Nigeria", 
    "Nigerian business tax", 
    "Siro", 
    "Siro Technologies", 
    "NRS compliance"
  ],
  authors: [{ name: "Siro Technologies" }],
  openGraph: {
    title: "Siro | Tax Readiness & Automated Records",
    description: "Automate your tax compliance and ditch the spreadsheets forever. Built for Nigerian businesses.",
    url: 'https://usesiro.com',
    siteName: 'Siro',
    images: [
      {
        url: '/logo.png', 
        width: 1200,
        height: 630,
        alt: 'Siro Technologies Logo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siro | Tax Readiness & Automated Records',
    description: 'Automate your tax compliance and ditch the spreadsheets forever.',
    images: ['/logo.png'], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  themeColor: '#2F6EF6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${fraunces.variable} font-sans`}>
        <LegacyTokenCleanup />
        <ServiceWorkerRegistration />
        
        {/* --- GOOGLE ORGANIZATION SCHEMA --- */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Siro Technologies",
              "url": "https://usesiro.com",
              "logo": "https://usesiro.com/icon.svg",
              "sameAs": [
                "https://twitter.com/usesiro",
                "https://linkedin.com/company/usesiro"
              ]
            })
          }}
        />

        <AOSInit />
        <NotificationProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </NotificationProvider>
        
        {/* --- INJECTED TRACKING SCRIPTS --- */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-Y7D62XQJKE" 
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y7D62XQJKE', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        
        {/* --- LUCKY ORANGE SESSION TRACKING --- */}
        <Script 
          src="https://tools.luckyorange.com/core/lo.js?site-id=4d5a072a"
          strategy="lazyOnload"
        />
        <Analytics />
      </body>
    </html>
  );
}
