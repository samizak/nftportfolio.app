"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import { useMetaMask } from "@/hooks/useMetaMask";
import ConnectWithMetaMask from "@/components/landing-page/connectWithMetaMaskDialog";

export default function Home() {
  const [address, setAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { accounts, isInstalled, connectMetaMask } = useMetaMask();

  const handleWalletConnect = async () => {
    if (!isInstalled) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    const newAccounts = await connectMetaMask();

    // Check the returned accounts from the function instead of the state
    if (newAccounts && newAccounts.length > 0) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <LandingPage
        address={address}
        setAddress={setAddress}
        onConnectMetamask={handleWalletConnect}
      />
      <ConnectWithMetaMask
        accounts={accounts}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </>
  );
}
