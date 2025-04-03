import Link from "next/link";
import { Wallet } from "lucide-react";
import { FaTwitter, FaLinkedinIn, FaDiscord } from "react-icons/fa";

export default function LandingFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
        <div className="flex flex-col gap-4 lg:w-1/3">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">nftportfolio.app</span>
          </div>
          <p className="text-muted-foreground">
            The complete platform for tracking, analyzing, and optimizing your
            NFT portfolio across multiple blockchains.
          </p>
          <div className="flex gap-4">
            {/* Social Links - Placeholder */}
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaTwitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaLinkedinIn className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaDiscord className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Product</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Company</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Resources</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-center text-xs text-muted-foreground md:px-6 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} nftportfolio.app. All rights reserved.
          </p>
          <p className="md:ml-auto">
            Made with ❤️ for NFT collectors worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
