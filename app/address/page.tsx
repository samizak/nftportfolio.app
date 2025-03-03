"use client";
import PortfolioView from '@/components/PortfolioView';
import { useSearchParams } from 'next/navigation';

export default function AddressPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const user = {
    name: "Pranksy",
    ethHandle: "pranksy.eth",
    ethAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
    avatar: "https://placehold.co/400"
  }

  return (
    <PortfolioView 
    onBack={() =>null}
    user={user}
  />
  )
}
