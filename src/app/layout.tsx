import type { Metadata } from "next";
import { Providers } from "./providers";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AddisView — Discover Ethiopia",
  description:
    "Your gateway to Ethiopian travel. Find stays, tours, dining, nightlife, and AI-powered trip planning.",
  keywords: [
    "Ethiopia",
    "Travel",
    "Addis Ababa",
    "Hotels",
    "Tours",
    "Restaurants",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-brand-dark antialiased">
        <Providers>
          <main className="max-w-lg mx-auto min-h-screen pb-24 px-4">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
