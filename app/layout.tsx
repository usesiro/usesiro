import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google"; 
import "./globals.css";
import { AOSInit } from "@/components/AOSInit";
import { Analytics } from "@vercel/analytics/react"; 
import { GoogleAnalytics } from "@next/third-parties/google"; 
import { NotificationProvider } from "@/context/NotificationContext";

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
  description: "Track income and expenses automatically, tag VAT, and generate clean NRS-compliant reports. Know exactly where your business stands without spreadsheets or last-minute panic.",
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${fraunces.variable} font-sans`}>
        <AOSInit />
        <NotificationProvider>
          {children}
        </NotificationProvider>
        
        {/* --- INJECTED TRACKING SCRIPTS --- */}
        <Analytics /> 
        <GoogleAnalytics gaId="G-Y7D62XQJKE" /> 
      </body>
    </html>
  );
}