"use client";
import React from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface LoadingCardProps {
  title?: string;
  rows?: number;
  columns?: number | number[];
  showTitle?: boolean;
  className?: string;
}

/**
 * Loading skeleton for card components (like ParcMainCard, ImmeubleMainCard)
 * @example
 * <LoadingCard title="Informations du parc" rows={2} columns={[2, 4]} />
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  rows = 2,
  columns = [2, 4],
  showTitle = true,
  className = "",
}) => {
  return (
    <div className={`p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          {showTitle && (
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              {title || <LoadingSkeleton variant="text" width="200px" height="24px" />}
            </h4>
          )}

          <div className="space-y-6">
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const colsArray = Array.isArray(columns) ? columns : [columns || 2];
              const cols = colsArray[rowIndex] || (rowIndex === 0 ? colsArray[0] : colsArray[1] || colsArray[0]);
              const gridColsClass = 
                cols === 2 ? "lg:grid-cols-2" :
                cols === 3 ? "lg:grid-cols-3" :
                cols === 4 ? "lg:grid-cols-4" :
                cols === 5 ? "lg:grid-cols-5" :
                cols === 6 ? "lg:grid-cols-6" :
                "lg:grid-cols-2";
              
              return (
                <div
                  key={rowIndex}
                  className={`grid grid-cols-1 gap-4 ${gridColsClass} ${
                    rowIndex === 0 ? "lg:gap-7 2xl:gap-x-32" : "lg:gap-6"
                  }`}
                >
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <div key={colIndex} className="space-y-2">
                      <LoadingSkeleton variant="text" width="120px" height="16px" />
                      <LoadingSkeleton variant="text" width="80px" height="32px" />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;

