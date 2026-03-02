import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AOSInit } from "@/components/AOSInit"; // <-- IMPORT HERE

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
      <body className={poppins.className}>
        <AOSInit /> {/* <-- ADD INSIDE BODY */}
        {children}
      </body>
    </html>
  );
}