"use client";
import React from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface LoadingMetricsProps {
  count?: number;
  className?: string;
}

/**
 * Loading skeleton for metrics cards (like ParcMetrics)
 * @example
 * <LoadingMetrics count={4} />
 */
export const LoadingMetrics: React.FC<LoadingMetricsProps> = ({
  count = 4,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mb-5">
            <LoadingSkeleton variant="circular" width={24} height={24} />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton variant="text" width="120px" height="16px" />
            <LoadingSkeleton variant="text" width="60px" height="24px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingMetrics;

