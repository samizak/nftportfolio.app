"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { containerClass } from "@/lib/utils";

export default function HeaderLandingPage() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full py-2.5 bg-background/80 backdrop-blur-md border-b border-border/40 text-foreground z-[100] shadow-sm">
      <div className={`${containerClass} mx-auto px-4`}>
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2"></div>
          <div className="flex items-center gap-2 pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
