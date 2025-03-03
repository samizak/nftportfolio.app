import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle"
import CurrencySelector from "@/components/CurrencySelector"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nftportfolio.app",
  description: "Track your NFT portfolio value and collections",
};

import ProfileMenu from "@/components/ProfileMenu"

// Mock user data - you can replace this with real user data later
const user = {
  name: "Pranksy",
  ethHandle: "pranksy.eth",
  ethAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
  avatar: "https://placehold.co/400"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <CurrencySelector />
            <ThemeToggle />
            <ProfileMenu user={user} />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
