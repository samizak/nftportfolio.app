"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Define the structure for progress info passed as props
interface ProgressInfo {
  step: string;
  processedItems?: number;
  totalItems?: number;
}

interface LoadingScreenProps {
  status: string;
  progress?: ProgressInfo | null; // Add optional progress prop
}

export default function LoadingScreen({
  status,
  progress, // Destructure progress prop
}: LoadingScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mountTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - mountTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [mountTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage if data is available
  const progressPercentage = progress?.totalItems
    ? Math.min(
        Math.round(
          ((progress.processedItems || 0) / progress.totalItems) * 100
        ),
        100
      )
    : null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-24 h-24">
            <Loader2 className="w-24 h-24 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">
                {progressPercentage !== null
                  ? `${progressPercentage}%` // Show percentage if available
                  : formatTime(elapsedTime)}{" "}
                {/* Otherwise show time */}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">{status}</h3>
            {/* Display detailed progress message if available */}
            {progress && (
              <p className="text-sm text-muted-foreground">
                Step: {progress.step}
                {progress.processedItems !== undefined &&
                  progress.totalItems !== undefined &&
                  ` (${progress.processedItems}/${progress.totalItems})`}
              </p>
            )}
            {/* Always display elapsed time */}
            <p className="text-xs text-muted-foreground pt-1">
              Elapsed Time: {formatTime(elapsedTime)}
            </p>
          </div>

          {/* Update progress bar style based on percentage */}
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            {" "}
            {/* Add overflow-hidden */}
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-linear" // Remove pulse, add transition
              style={{ width: `${progressPercentage ?? 100}%` }} // Use percentage for width
            ></div>
          </div>

          <p className="text-sm text-muted-foreground">
            This may take a few minutes for large collections
          </p>
        </div>
      </div>
    </div>
  );
}
