import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

const LoadingOverlay = ({ 
  isLoading, 
  message = "Processing Document", 
  subMessage = "Extracting text and generating questions..." 
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">{message}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {subMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
