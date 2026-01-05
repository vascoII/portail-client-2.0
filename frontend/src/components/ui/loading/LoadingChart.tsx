"use client";
import React from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { LoadingContainer } from "./LoadingContainer";

export interface LoadingChartProps {
  height?: number;
  message?: string;
  variant?: "radial" | "bar" | "line";
  showTitle?: boolean;
  title?: string;
  className?: string;
}

/**
 * Loading component for charts (like VosReleves)
 * @example
 * <LoadingChart height={330} message="Chargement des données..." variant="radial" />
 */
export const LoadingChart: React.FC<LoadingChartProps> = ({
  height = 330,
  message = "Chargement des données...",
  variant = "radial",
  showTitle = true,
  title,
  className = "",
}) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        {showTitle && (
          <div className="mb-6">
            {title ? (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h3>
            ) : (
              <LoadingSkeleton variant="text" width="150px" height="24px" />
            )}
          </div>
        )}

        <div className="relative" style={{ minHeight: `${height}px` }}>
          {variant === "radial" ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative w-64 h-64">
                <LoadingSkeleton variant="circular" width={256} height={256} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSkeleton variant="text" width="80px" height="40px" />
                </div>
              </div>
            </div>
          ) : (
            <LoadingContainer message={message} minHeight={`${height}px`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingChart;

