import { Suspense } from "react";
import { ActivityClientWrapper } from "./ActivityClientWrapper";
import LoadingScreen from "@/components/LoadingScreen";

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
