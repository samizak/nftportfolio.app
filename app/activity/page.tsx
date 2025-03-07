import { Suspense } from "react";
import { ActivityClientWrapper } from "./ActivityClientWrapper";
import LoadingScreen from "@/components/LoadingScreen";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "NFT Activity | NFT Portfolio Tracker",
  description: "View your NFT transaction history and activity",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const id = searchParams.id;

  return (
    <Suspense
      fallback={
        <LoadingScreen
          status="Loading activity data..."
          count={0}
          startTime={Date.now()}
        />
      }
    >
      <ActivityClientWrapper id={id} />
    </Suspense>
  );
}
