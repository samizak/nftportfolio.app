"use client";

import UserProfile from "@/components/UserProfile";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { containerClass } from "@/lib/utils";
import ActivityTable, {
  ActivityEvent,
} from "@/components/activity/ActivityTable";
import { Loader2 } from "lucide-react";

interface ActivityViewProps {
  user: any;
  events: ActivityEvent[];
  isLoading: boolean;
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
  error,
  currentPage,
  totalPages,
  totalEvents,
  itemsPerPage,
  onPageChange,
}: ActivityViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        {user && <Header user={user} activePage="activity" />}

        {user && <UserProfile user={user} />}

        {error && (
          <div className="mb-4 p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-md">
            Error loading activity: {error}
          </div>
        )}

        <div className="overflow-hidden">
          {!isLoading && events.length === 0 && !error ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-muted">
              <p className="text-muted-foreground mb-3 text-xl font-medium">
                No activity found for this wallet
              </p>
              <p className="text-sm text-muted-foreground">
                Try checking another wallet or come back later
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ActivityTable
                events={events}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalEvents={totalEvents}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
          {isLoading && events.length > 0 && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
