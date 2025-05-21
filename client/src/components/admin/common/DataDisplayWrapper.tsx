import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface DataDisplayWrapperProps {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
  loadingText?: string;
  count?: number;
  noDataMessage?: string;
}

export const DataDisplayWrapper: React.FC<DataDisplayWrapperProps> = ({
  isLoading,
  error,
  children,
  loadingText = "Loading data...",
  count,
  noDataMessage = "No data available.",
}) => {
  if (isLoading) {
    return <div className="flex items-center justify-center p-4 min-h-[100px]"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingText}</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center p-4 text-red-500 min-h-[100px]"><AlertCircle className="mr-2 h-5 w-5" /> Error: {error}</div>;
  }
  if (count !== undefined && count === 0 && !isLoading && !error) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400 min-h-[100px]">{noDataMessage}</div>;
  }
  return <>{children}</>;
};