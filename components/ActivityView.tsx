"use client";

import UserProfile from "@/components/UserProfile";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { containerClass } from "@/lib/utils";
import ActivityTable, {
  ActivityEvent,
} from "@/components/activity/ActivityTable";
import { Loader2, Info } from "lucide-react";

interface ActivityViewProps {
  user: any;
  events: ActivityEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
}

export default function ActivityView({
  user,
  events,
  isLoading,
  isSyncing,
  error,
  currentPage,
  totalPages,
  totalEvents,
  itemsPerPage,
  onPageChange,
}: ActivityViewProps) {
  const getEmptyStateMessage = () => {
    if (isLoading) {
      return {
        title: "Loading activity...",
        description: "Please wait while we fetch the events.",
      };
    } else if (isSyncing) {
      return {
        title: "Checking for latest activity...",
        description: "This may take a moment.",
      };
    } else if (error) {
      return {
        title: "Error loading activity",
        description: error || "An unexpected error occurred.",
      };
    } else {
      return {
        title: "No activity found for this wallet",
        description: "Try checking another wallet or come back later.",
      };
    }
  };

  const emptyState = getEmptyStateMessage();
  const showTable = events.length > 0;
  const showEmptyState = !isLoading && !showTable && !error && !isSyncing;
  const showInitialLoadingOrSyncingMessage =
    (isLoading || isSyncing) && !showTable && !error;

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        {user && <Header user={user} activePage="activity" />}

        {user && <UserProfile user={user} />}

        <div className="mb-4 space-y-2">
          {error && (
            <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-md">
              {error}
            </div>
          )}
          {isSyncing && !isLoading && showTable && (
            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground bg-muted/30 border border-muted rounded-md">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Updating activity in the background...</span>
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          {showTable && (
            <div className="overflow-x-auto">
              <ActivityTable
                events={events}
                isLoading={isLoading && showTable}
                currentPage={currentPage}
                totalPages={totalPages}
                totalEvents={totalEvents}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          )}

          {showInitialLoadingOrSyncingMessage && (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-muted">
              <Loader2 className="h-6 w-6 mb-3 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mb-1 text-xl font-medium">
                {emptyState.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {emptyState.description}
              </p>
            </div>
          )}

          {showEmptyState && (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-muted">
              <Info className="h-8 w-8 mb-3 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mb-1 text-xl font-medium">
                {emptyState.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {emptyState.description}
              </p>
            </div>
          )}

          {isLoading && showTable && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
