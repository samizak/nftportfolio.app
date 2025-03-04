"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    <div className="flex items-center mb-8 gap-4">
      <Avatar className="h-28 w-28 border-2 border-primary">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <div className="flex items-center">
          {user.ethHandle ? (
            <span className="text-muted-foreground">{user.ethHandle}</span>
          ) : (
            <span className="text-muted-foreground truncate max-w-[200px]">
              {user.ethAddress}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
  );
}
