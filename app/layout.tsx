import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google"; // <-- IMPORTED FRAUNCES
import "./globals.css";
import { AOSInit } from "@/components/AOSInit";

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
  title: "Siro | Tax Readiness & Automated Records",
  description: "Track income and expenses automatically. Know exactly where your business stands without spreadsheets, guesswork, or last-minute panic.",
  icons: {
    icon: '/icon.svg', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* INJECT BOTH VARIABLES AND SET DEFAULT SANS */}
      <body className={`${poppins.variable} ${fraunces.variable} font-sans`}>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}