"use client";

import UserProfile from "@/components/UserProfile";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { containerClass } from "@/lib/utils";
import ActivityTable, {
  ActivityEvent,
} from "@/components/activity/ActivityTable";

export default function ActivityView({
  user,
  events,
}: {
  user: any;
  events: ActivityEvent[];
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className={`${containerClass} p-4 flex-grow pb-20`}>
        <Header user={user} activePage="activity" />

        <UserProfile user={user} />

        <div className="overflow-hidden">
          {events.length === 0 ? (
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
              <ActivityTable events={events} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
