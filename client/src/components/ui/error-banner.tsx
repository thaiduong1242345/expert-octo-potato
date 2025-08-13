import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div className="fixed top-16 left-4 right-4 z-[1001] bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Connection Error</p>
          <p className="text-sm text-red-700" data-testid="text-error-message">
            {error}. Retrying automatically...
          </p>
        </div>
        <button 
          onClick={onDismiss}
          className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors"
          data-testid="button-dismiss-error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
