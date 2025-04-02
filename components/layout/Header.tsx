"use client";

import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import CurrencySelector from "@/components/CurrencySelector";
import { ThemeToggle } from "@/components/theme-toggle";
import { containerClass } from "@/lib/utils";
import { useState, FormEvent } from "react";
import { Search, AlertCircle, Menu, X } from "lucide-react";
import { isAddress } from "ethers";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
  user: User;
  activePage: "portfolio" | "activity" | "overview";
}

export default function Header({ user, activePage }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) return;

    const isEthAddress = isAddress(query);
    const isEnsName = query.toLowerCase().endsWith(".eth");

    if (!isEthAddress && !isEnsName) {
      setValidationError("Please enter a valid ETH address or ENS name");
      return;
    }

    setValidationError(null);
    router.push(`/${activePage}?id=${query}`);
    setSearchQuery("");
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full py-2.5 bg-background/80 backdrop-blur-md border-b border-border/40 text-foreground z-[100] shadow-sm">
      <div className={`${containerClass} mx-auto px-4`}>
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <Link href="/" className="cursor-pointer">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                nftportfolio.app
              </h1>
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="max-w-md w-full mx-4 relative hidden sm:flex items-center gap-1 lg:max-w-xs xl:max-w-md"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationError(null);
                  }
                }}
                placeholder="ETH address or ENS..."
                className={`h-9 pl-9 pr-3 ${
                  validationError
                    ? "border-destructive focus-visible:ring-destructive/50"
                    : ""
                }`}
                aria-label="Search address or ENS name"
              />
              {validationError && (
                <div
                  className="absolute top-full mt-1.5 left-0 right-0 px-3 py-1.5 rounded-md
                  bg-destructive/95 text-destructive-foreground text-xs shadow-md animate-in fade-in
                  slide-in-from-top-1 duration-150 flex items-center gap-1.5
                  border border-destructive-foreground/20 z-20"
                >
                  <AlertCircle className="h-3.5 w-3.5 stroke-[2.5px]" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-9 w-9"
              aria-label="Submit search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="hidden sm:flex items-center gap-1">
            <Link
              href={`/overview?id=${user.ethAddress}`}
              className={buttonVariants({
                variant: activePage === "overview" ? "secondary" : "ghost",
                size: "sm",
              })}
            >
              Overview
            </Link>
            <Link
              href={`/portfolio?id=${user.ethAddress}`}
              className={buttonVariants({
                variant: activePage === "portfolio" ? "secondary" : "ghost",
                size: "sm",
              })}
            >
              Portfolio
            </Link>
            <Link
              href={`/activity?id=${user.ethAddress}`}
              className={buttonVariants({
                variant: activePage === "activity" ? "secondary" : "ghost",
                size: "sm",
              })}
            >
              Activity
            </Link>

            <div className="flex items-center gap-1 pl-3">
              <CurrencySelector />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-border/40 mt-2 animate-in slide-in-from-top duration-200">
            <div className="space-y-3">
              <form
                onSubmit={handleSearch}
                className="relative flex items-center gap-1"
              >
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        setValidationError(null);
                      }
                    }}
                    placeholder="ETH address or ENS..."
                    className={`h-9 pl-9 pr-3 ${
                      validationError
                        ? "border-destructive focus-visible:ring-destructive/50"
                        : ""
                    }`}
                    aria-label="Search address or ENS name"
                  />
                  {validationError && (
                    <div
                      className="absolute top-full mt-1.5 left-0 right-0 px-3 py-1.5 rounded-md
                      bg-destructive/95 text-destructive-foreground text-xs shadow-md animate-in fade-in
                      slide-in-from-top-1 duration-150 flex items-center gap-1.5
                      border border-destructive-foreground/20 z-20"
                    >
                      <AlertCircle className="h-3.5 w-3.5 stroke-[2.5px]" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-9 w-9"
                  aria-label="Submit search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-col space-y-1 pt-2">
                <Link
                  href={`/overview?id=${user.ethAddress}`}
                  className={buttonVariants({
                    variant: activePage === "overview" ? "secondary" : "ghost",
                    size: "sm",
                    className: "w-full justify-start",
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Overview
                </Link>
                <Link
                  href={`/portfolio?id=${user.ethAddress}`}
                  className={buttonVariants({
                    variant: activePage === "portfolio" ? "secondary" : "ghost",
                    size: "sm",
                    className: "w-full justify-start",
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Portfolio
                </Link>
                <Link
                  href={`/activity?id=${user.ethAddress}`}
                  className={buttonVariants({
                    variant: activePage === "activity" ? "secondary" : "ghost",
                    size: "sm",
                    className: "w-full justify-start",
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Activity
                </Link>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
                <CurrencySelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
