"use client";

import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: User;
  activePage: "portfolio" | "activity";
}

export default function Header({ user, activePage }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">nftportfolio.app</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/portfolio?id=${user.ethAddress}`)}
            className={`px-4 py-2 rounded-lg cursor-pointer ${
              activePage === "portfolio"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => router.push(`/activity?id=${user.ethAddress}`)}
            className={`px-4 py-2 rounded-lg cursor-pointer ${
              activePage === "activity"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Activity
          </button>
        </div>
      </div>
    </div>
  );
}
