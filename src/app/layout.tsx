import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#82d4fa",
};

export const metadata: Metadata = {
  title: "Vibe Coding | Workshop & Hackathon",
  description: "Join the ultimate fusion of Gen AI Workshop and a 24-Hour Hackathon at ANITS. Build, innovate, and vibe with the best minds.",
  keywords: ["hackathon", "workshop", "coding", "ANITS", "Gen AI", "programming competition"],
  authors: [{ name: "Vibe Coding Team" }],
  openGraph: {
    title: "Vibe Coding | Workshop & Hackathon",
    description: "Join the ultimate fusion of Gen AI Workshop and a 24-Hour Hackathon",
    type: "website",
    locale: "en_US",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import { DataProvider } from "@/lib/context/DataContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <DataProvider>
          {children}
          <Toaster position="top-center" richColors />
        </DataProvider>
      </body>
    </html>
  );
}
