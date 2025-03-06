"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
    banner: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Copied ${field} to clipboard`, {
        duration: 2000,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex flex-col rounded-xl border mb-8 shadow-sm overflow-hidden">
      {/* Banner section with gradient overlay */}
      <div className="relative h-80 w-full">
        {user.banner !== "" && !bannerError ? (
          <div className="relative h-full w-full">
            <Image
              src={user.banner}
              alt="Profile banner"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onError={() => setBannerError(true)}
              unoptimized={user.banner.endsWith(".gif")}
            />
            {/* Gradient overlay for banner image */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/80"></div>
          </div>
        ) : (
          <div className="w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20"></div>
            {/* Replace the missing grid pattern with a CSS-based pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"></div>
          </div>
        )}
      </div>

      {/* Profile content section */}
      <div className="relative px-8 pb-6">
        {/* Avatar - positioned to overlap the banner */}
        <div className="absolute -top-16 left-8">
          <Avatar className="h-36 w-36 border-2 border-primary ring-4 ring-background shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>

        {/* User info with proper spacing */}
        <div className="pt-24 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <div className="flex items-center">
            {user.ethHandle ? (
              <span className="text-muted-foreground">{user.ethHandle}</span>
            ) : (
              <span className="text-muted-foreground truncate max-w-[200px]">
                {user.ethAddress}
              </span>
            )}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="z-[20]"
              >
                <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.ethHandle && (
                  <DropdownMenuItem
                    className="flex flex-row items-center justify-between cursor-pointer"
                    onClick={() => copyToClipboard(user.ethHandle, "ENS")}
                  >
                    <span className="font-medium">{user.ethHandle}</span>
                    {copiedField === "ENS" ? (
                      <Check className="h-4 w-4 ml-2 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 ml-2 text-muted-foreground" />
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex flex-row items-center justify-between cursor-pointer"
                  onClick={() => copyToClipboard(user.ethAddress, "address")}
                >
                  <span className="font-medium truncate max-w-[200px]">
                    {user.ethAddress}
                  </span>
                  {copiedField === "address" ? (
                    <Check className="h-4 w-4 ml-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
