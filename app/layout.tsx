import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/app-shell";

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
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
