import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Sora, DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap"
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  display: "swap"
});

const playfair = Playfair_Display({
  variable: "--font-callout",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Subconscious Survey by Husbar",
  description:
    "Behavioral intelligence platform for measuring implicit brand associations and generating psychology-based marketing strategy."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${jetbrains.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-body">
        <div className="bg-gradient-to-b from-emerald-950/70 via-[#040d09] to-black">
          {children}
        </div>
      </body>
    </html>
  );
}

