import { Suspense } from "react";
import { PortfolioClientWrapper } from "./PortfolioClientWrapper";
import LoadingScreen from "@/components/LoadingScreen";
import { Metadata } from "next/types";
import LenisScroller from "@/components/LenisScroller";

export const metadata: Metadata = {
  title: "NFT Portfolio | NFT Portfolio Tracker",
  description: "View your NFT portfolio value and collection details",
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id || "";

  return (
    <Suspense fallback={<LoadingScreen status="Loading portfolio data..." />}>
      <LenisScroller>
        <PortfolioClientWrapper id={id} />
      </LenisScroller>
    </Suspense>
  );
}
