import { Suspense } from "react";
import { PortfolioClientWrapper } from "./PortfolioClientWrapper";
import LoadingScreen from "@/components/LoadingScreen";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "NFT Portfolio | NFT Portfolio Tracker",
  description: "View your NFT portfolio value and collection details",
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id || null;

  return (
    <Suspense
      fallback={
        <LoadingScreen
          status="Loading portfolio data..."
          count={0}
          startTime={Date.now()}
        />
      }
    >
      <PortfolioClientWrapper id={id} />
    </Suspense>
  );
}
