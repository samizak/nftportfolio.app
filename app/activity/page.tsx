import { Suspense } from "react";
import { ActivityClientWrapper } from "./ActivityClientWrapper";
import LoadingScreen from "@/components/LoadingScreen";
import { Metadata } from "next/types";
import LenisScroller from "@/components/LenisScroller";

export const metadata: Metadata = {
  title: "NFT Activity | NFT Portfolio Tracker",
  description: "View your NFT transaction history and activity",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; refresh?: string }>;
}) {
  const params = await searchParams;
  const id = params.id || "";

  return (
    <Suspense fallback={<LoadingScreen status="Loading activity data..." />}>
      <LenisScroller>
        <ActivityClientWrapper id={id} />
      </LenisScroller>
    </Suspense>
  );
}
