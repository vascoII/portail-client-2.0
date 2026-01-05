"use client";
import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export interface LoadingContainerProps {
  message?: string;
  minHeight?: string;
  showSpinner?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Generic loading container with spinner and optional message
 * @example
 * <LoadingContainer message="Chargement des données..." minHeight="400px" />
 */
export const LoadingContainer: React.FC<LoadingContainerProps> = ({
  message = "Chargement...",
  minHeight = "300px",
  showSpinner = true,
  className = "",
  children,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ minHeight }}
    >
      {showSpinner && <LoadingSpinner size="lg" color="primary" />}
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
      {children}
    </div>
  );
};

export default LoadingContainer;

