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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C8102E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mebira" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <SupabaseSessionRefresh />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </body>
    </html>
  );
}
