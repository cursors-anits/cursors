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
  metadataBase: new URL('https://cursors-anits.vercel.app'),
  title: "Vibe Coding | 24H Hackathon",
  description: "Join the ultimate 24-Hour Hackathon at ANITS. Build, innovate, and vibe with the best minds.",
  keywords: ["hackathon", "coding", "ANITS", "programming competition", "tech event"],
  authors: [{ name: "Vibe Coding Team" }],
  openGraph: {
    title: "Vibe Coding | 24H Hackathon",
    description: "Join the ultimate 24-Hour Hackathon at ANITS",
    type: "website",
    locale: "en_US",
    images: [{
      url: "/link preview.png",
      width: 1200,
      height: 630,
      alt: "Vibe Coding Event Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding | 24H Hackathon",
    description: "Join the ultimate 24-Hour Hackathon at ANITS",
    images: ["/link preview.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <DataProvider>
          {children}
          <Toaster position="top-center" richColors />
        </DataProvider>
      </body>
    </html>
  );
}
