"use client";

import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import CurrencySelector from "@/components/CurrencySelector";
import { ThemeToggle } from "@/components/theme-toggle";
import { containerClass } from "@/lib/utils";
import { useState, FormEvent } from "react";
import { Search, AlertCircle } from "lucide-react";
import { isAddress } from "ethers";

interface HeaderProps {
  user: User;
  activePage: "portfolio" | "activity";
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

    // Check if it's a valid Ethereum address or ENS name
    const isEthAddress = isAddress(query);
    const isEnsName = query.toLowerCase().endsWith(".eth");

    if (!isEthAddress && !isEnsName) {
      setValidationError("Please enter a valid ETH address or ENS name");
      return;
    }

    // Clear any previous validation errors
    setValidationError(null);

    // Navigate to the appropriate page based on active page
    router.push(`/${activePage}?id=${query}`);
    setSearchQuery(""); // Clear the search field after submission
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full py-2.5 bg-background/80 backdrop-blur-md border-b border-border/40 text-foreground z-[100] shadow-sm">
      <div className={`${containerClass} mx-auto px-4`}>
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            >
              nftportfolio.app
            </h1>
          </div>

          {/* Search form - now responsive with different sizes */}
          <form
            onSubmit={handleSearch}
            className="max-w-md w-full mx-4 relative hidden sm:block lg:max-w-xs xl:max-w-md"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setValidationError(null);
                }}
                placeholder="ETH address or ENS..."
                className={`w-full h-9 pl-9 pr-4 rounded-full bg-secondary/30 border transition-all outline-none ${
                  validationError
                    ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                    : "border-border/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                } text-sm`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-xs bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Search"
              >
                →
              </button>
            </div>
            {validationError && (
              <div
                className="absolute -bottom-9 left-0 right-0 px-3 py-1.5 rounded-md 
              bg-destructive/90 text-white shadow-md animate-in fade-in 
              slide-in-from-top-2 duration-200 flex items-center gap-1.5
              border border-destructive-foreground/20"
              >
                <AlertCircle className="h-4 w-4 stroke-[2.5px] text-white" />
                <span className="text-sm font-medium tracking-tight">
                  {validationError}
                </span>
              </div>
            )}
          </form>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center gap-2">
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

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-sm font-medium bg-secondary/70 text-secondary-foreground"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-border/40 mt-2 animate-in slide-in-from-top duration-200">
            <div className="space-y-3">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="ETH address or ENS..."
                  className={`w-full h-9 pl-9 pr-4 rounded-full bg-secondary/30 border transition-all outline-none ${
                    validationError
                      ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                      : "border-border/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                  } text-sm`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-xs bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label="Search"
                >
                  →
                </button>
                {validationError && (
                  <div className="absolute -bottom-8 left-0 right-0 px-3 py-1.5 text-xs rounded-md bg-destructive/90 text-destructive-foreground shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationError}
                  </div>
                )}
              </form>

              {/* Mobile navigation */}
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  onClick={() => {
                    router.push(`/portfolio?id=${user.ethAddress}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    activePage === "portfolio"
                      ? "bg-primary/90 text-primary-foreground shadow-sm"
                      : "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90"
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => {
                    router.push(`/activity?id=${user.ethAddress}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    activePage === "activity"
                      ? "bg-primary/90 text-primary-foreground shadow-sm"
                      : "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90"
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Mobile settings */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span></span>
                <div className="flex items-center gap-2">
                  <CurrencySelector />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
