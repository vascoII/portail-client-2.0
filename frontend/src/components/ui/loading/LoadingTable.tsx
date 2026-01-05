"use client";
import React from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { LoadingContainer } from "./LoadingContainer";

export interface LoadingTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  message?: string;
  variant?: "skeleton" | "spinner";
  className?: string;
}

/**
 * Loading component for table lists (like ListImmeubles, ListLogements)
 * @example
 * <LoadingTable rows={5} columns={6} showHeader message="Chargement des immeubles..." />
 */
export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 6,
  showHeader = true,
  message = "Chargement...",
  variant = "skeleton",
  className = "",
}) => {
  if (variant === "spinner") {
    return (
      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 ${className}`}>
        <LoadingContainer message={message} minHeight="400px" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 ${className}`}>
      {showHeader && (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <LoadingSkeleton key={index} variant="text" width="100px" height="16px" />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton key={colIndex} variant="text" width="80%" height="20px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingTable;

