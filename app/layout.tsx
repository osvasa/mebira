import type { Metadata } from "next";
import { SupabaseSessionRefresh } from "@/components/auth/SupabaseSessionRefresh";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mebira — Discover & Book Travel",
  description:
    "A social travel discovery platform where creators and AI share stunning hotels, restaurants, and destinations. Book through Expedia and earn commissions.",
  keywords: "travel, hotels, restaurants, destinations, Expedia, booking, social",
  openGraph: {
    title: "Mebira — Discover & Book Travel",
    description: "Social travel discovery — beautiful recommendations, instant booking.",
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
