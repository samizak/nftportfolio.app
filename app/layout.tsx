import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import CurrencySelector from "@/components/CurrencySelector";
import { UserProvider } from "@/context/UserContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import UserHeader from "@/components/UserHeader";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <CurrencyProvider>
              <div className="fixed top-4 right-4 flex items-center gap-4 z-50">
                <div className="mr-2">
                  <CurrencySelector />
                </div>
                <ThemeToggle />
                <UserHeader />
              </div>
              <div className="pt-16">
                {children}
              </div>
            </CurrencyProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
