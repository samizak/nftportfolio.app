"use client"

import { useState } from "react"
import LandingPage from "@/components/LandingPage"

export default function Home() {
  const [address, setAddress] = useState("")

  const connectMetamask = async () => {
    const ethereum = (window as any).ethereum;
    
    if (typeof ethereum !== 'undefined') {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          window.location.href = `/address?id=${accounts[0]}`;
        }
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  }
  
  return (
    <LandingPage 
      address={address}
      setAddress={setAddress}
      onConnectMetamask={connectMetamask}
    />
  )
}