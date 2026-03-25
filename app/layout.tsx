import type { Metadata } from "next";
import { SupabaseSessionRefresh } from "@/components/auth/SupabaseSessionRefresh";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mebira — Discover Properties Worldwide",
  description:
    "Browse exclusive property listings shared by top realtors. Find apartments, houses, villas, and more.",
  keywords: "real estate, properties, apartments, houses, villas, listings, realtors",
  openGraph: {
    title: "Mebira — Discover Properties Worldwide",
    description: "Browse exclusive property listings shared by top realtors. Find apartments, houses, villas, and more.",
    url: "https://mebira.pro",
    siteName: "Mebira",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SupabaseSessionRefresh />
        {children}
      </body>
    </html>
  );
}
