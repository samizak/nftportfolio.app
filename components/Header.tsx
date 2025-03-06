"use client";

import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import CurrencySelector from "@/components/CurrencySelector";
import { ThemeToggle } from "@/components/theme-toggle";
import { containerClass } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  user: User;
  activePage: "portfolio" | "activity";
}

export default function Header({ user, activePage }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 w-full py-2.5 bg-background/95 backdrop-blur-md border-b border-border/40 text-foreground z-[100] shadow-sm">
      <div className={`${containerClass} mx-auto px-4`}>
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <h1 
              onClick={() => router.push('/')} 
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              nftportfolio.app
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/portfolio?id=${user.ethAddress}`)}
              className={`px-3.5 cursor-pointer py-1.5 rounded-md text-sm mr-2 font-medium transition-all ${
                activePage === "portfolio"
                  ? "bg-primary/90 text-primary-foreground shadow-sm"
                  : "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90"
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => router.push(`/activity?id=${user.ethAddress}`)}
              className={`px-3.5 py-1.5 cursor-pointer rounded-md text-sm font-medium transition-all ${
                activePage === "activity"
                  ? "bg-primary/90 text-primary-foreground shadow-sm"
                  : "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90"
              }`}
            >
              Activity
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-border/40">
              <CurrencySelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
