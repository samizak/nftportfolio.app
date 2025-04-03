"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLenis } from "@/components/LenisScroller";
import type { MouseEvent } from "react";

export default function LandingHeader() {
  const lenis = useLenis();

  const handleNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(targetId);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">nftportfolio.app</span>
        </div>
        <nav className="hidden md:flex gap-6 mx-auto">
          <Link
            href="#features"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={(e) => handleNavClick(e, "#features")}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={(e) => handleNavClick(e, "#how-it-works")}
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={(e) => handleNavClick(e, "#pricing")}
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={(e) => handleNavClick(e, "#faq")}
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Sign In
          </Link>
          <Link href="/track">
            <Button asChild>
              <span>Get Started</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
