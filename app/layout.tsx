import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { PwaRegistration } from "@/components/pwa-registration";

import type { Metadata } from "next";
import type React from "react";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Finance Tracker - Manage Your Money",
  description: "Finance tracking app for expenses, income, investments, and net worth",
  applicationName: "Finance Tracker",
  manifest: "/manifest.webmanifest",
  themeColor: "#101827",
  appleWebApp: {
    capable: true,
    title: "Finance Tracker",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <PwaRegistration />
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
