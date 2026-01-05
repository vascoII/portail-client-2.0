/**
 * Loading Components API
 * 
 * A comprehensive set of loading components for consistent loading states across the application.
 * All components are built with Tailwind CSS 2025 best practices and support dark mode.
 * 
 * @example
 * ```tsx
 * import { LoadingSpinner, LoadingCard, LoadingTable } from '@/components/ui/loading';
 * 
 * // Simple spinner
 * <LoadingSpinner size="md" color="primary" />
 * 
 * // Card loading
 * <LoadingCard title="Informations" rows={2} columns={[2, 4]} />
 * 
 * // Table loading
 * <LoadingTable rows={5} columns={6} message="Chargement des données..." />
 * ```
 */

export { LoadingSpinner } from "./LoadingSpinner";
export { LoadingSkeleton } from "./LoadingSkeleton";
export { LoadingContainer } from "./LoadingContainer";
export { LoadingCard } from "./LoadingCard";
export { LoadingTable } from "./LoadingTable";
export { LoadingMetrics } from "./LoadingMetrics";
export { LoadingChart } from "./LoadingChart";

// Type exports
export type { LoadingSpinnerProps } from "./LoadingSpinner";
export type { LoadingSkeletonProps } from "./LoadingSkeleton";
export type { LoadingContainerProps } from "./LoadingContainer";
export type { LoadingCardProps } from "./LoadingCard";
export type { LoadingTableProps } from "./LoadingTable";
export type { LoadingMetricsProps } from "./LoadingMetrics";
export type { LoadingChartProps } from "./LoadingChart";

