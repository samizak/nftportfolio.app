"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConnectWithMetaMask({
  accounts,
  isDialogOpen,
  setIsDialogOpen,
}: {
  accounts: string[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) {
  const router = useRouter();

  const selectAccount = (account: string) => {
    router.push(`/portfolio?id=${account}`);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md w-full p-0 overflow-hidden bg-background/95 backdrop-blur-sm border shadow-lg rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Image
              src="/metamask-fox.svg"
              alt="Metamask"
              width={24}
              height={24}
              style={{ height: "auto" }}
            />
            Select Account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Choose which MetaMask account you want to connect with
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 py-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
          {accounts.map((account, index) => (
            <div key={account} className="px-2">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-5 py-8 hover:bg-muted/50 rounded-xl transition-all duration-200 group relative"
                onClick={() => selectAccount(account)}
              >
                <div className="flex items-center gap-4 w-full overflow-hidden">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-base font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium text-base group-hover:text-primary transition-colors flex items-center gap-2">
                      Account {index + 1}
                      {index === 0 && (
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-muted-foreground truncate max-w-[250px] mt-1">
                      {account}
                    </div>
                  </div>
                </div>
                <div className="ml-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
                  Select →
                </div>
              </Button>
              {index < accounts.length - 1 && (
                <div className="h-px bg-border/40 w-full my-3 mx-auto max-w-[calc(100%-2rem)]" />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-border/40 bg-muted/30">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Connected with MetaMask</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:text-primary"
              onClick={() => window.open("https://metamask.io", "_blank")}
            >
              Learn More →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
