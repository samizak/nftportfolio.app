interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full shadow-sm text-center">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="w-24 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-md text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}