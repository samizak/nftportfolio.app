"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserProfileProps {
  user: {
    name: string;
    ethHandle: string;
    ethAddress: string;
    avatar: string;
  }
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center mb-8 gap-4">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <div className="flex items-center">
          <span className="text-muted-foreground">{user.ethHandle}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-row items-center justify-between cursor-pointer">
                <span className="font-medium">{user.ethHandle}</span>
                <Copy className="h-4 w-4 ml-2 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-row items-center justify-between cursor-pointer">
                <span className="font-medium truncate max-w-[200px]">{user.ethAddress}</span>
                <Copy className="h-4 w-4 ml-2 text-muted-foreground" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}