import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatThousandSeparator } from "@/utils/formatters";

interface LoadingScreenProps {
  status: string;
  count: number;
  startTime: number;
}

export default function LoadingScreen({
  status,
  count,
  startTime,
}: LoadingScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-24 h-24">
            <Loader2 className="w-24 h-24 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">{status}</h3>
            {count > 0 && (
              <p className="text-muted-foreground">
                Found {formatThousandSeparator(count)} NFTs so far
              </p>
            )}
          </div>

          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full animate-pulse"></div>
          </div>

          <p className="text-sm text-muted-foreground">
            This may take a few minutes for large collections
          </p>
        </div>
      </div>
    </div>
  );
}
