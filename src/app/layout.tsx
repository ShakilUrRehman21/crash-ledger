import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CrashLedger – Operational Failure Intelligence",
  description:
    "Track incidents, analyze root causes, measure operational risk, and prevent recurring failures. The platform for engineering teams that take reliability seriously.",
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        {/* Force HMR */}
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
