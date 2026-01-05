import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { DashboardResponse, ChantierData } from "@/lib/types/api";

/**
 * Parameters for intervention report request
 */
export interface InterventionReportParams {
  docType: "synthese-inte" | "detail-inte" | "detail-excel-inte";
  dateBegin: string; // Format: d/m/Y (e.g., "01/01/2024")
  dateEnd: string; // Format: d/m/Y (e.g., "31/12/2024")
}

/**
 * Response from dashboard API
 */
export interface DashboardApiResponse {
  board: any; // DashboardData normalized
  chantier: ChantierData;
  demo?: boolean;
}

/**
 * Helper function to download a blob file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Custom hook for Dashboard API endpoints
 *
 * Provides all dashboard-related API calls including:
 * - Dashboard data (board, chantier statistics)
 * - Intervention reports (PDF/Excel downloads)
 *
 * @example
 * ```tsx
 * const { getDashboard, getInterventionReport, dashboardData, dashboardIsLoading } = useDashboard();
 *
 * // Get dashboard data
 * const dashboard = await getDashboard();
 *
 * // Download intervention report
 * await getInterventionReport({
 *   docType: "synthese-inte",
 *   dateBegin: "01/01/2024",
 *   dateEnd: "31/12/2024",
 * });
 * ```
 */
export function useDashboard() {
  const queryClient = useQueryClient();

  /**
   * Get dashboard data query
   * GET /api/dashboard
   */
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardResponse> => {
      const response = await api.get<DashboardApiResponse>("/dashboard");
      const data = extractApiData<DashboardApiResponse>(response);
      
      return {
        board: data.board,
        chantier: data.chantier,
        demo: data.demo ?? false,
      };
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
  });

  /**
   * Get dashboard data
   * Refetches the dashboard query
   * @returns Promise with dashboard data
   */
  const getDashboard = async (): Promise<DashboardResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["dashboard"],
      queryFn: async (): Promise<DashboardResponse> => {
        const response = await api.get<DashboardApiResponse>("/dashboard");
        const data = extractApiData<DashboardApiResponse>(response);
        
        return {
          board: data.board,
          chantier: data.chantier,
          demo: data.demo ?? false,
        };
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get intervention report (PDF or Excel)
   * GET /api/dashboard/intervention
   * Downloads the file automatically
   * 
   * @param params - Report parameters (docType, dateBegin, dateEnd)
   * @returns Promise that resolves when download is complete
   */
  const getInterventionReport = async (
    params: InterventionReportParams
  ): Promise<void> => {
    try {
      // Validate date format (d/m/Y)
      const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateFormatRegex.test(params.dateBegin) || !dateFormatRegex.test(params.dateEnd)) {
        throw new Error("Invalid date format. Expected format: d/m/Y (e.g., 01/01/2024)");
      }

      // Determine file extension based on docType
      const isExcel = params.docType === "detail-excel-inte";
      const fileExtension = isExcel ? "xlsx" : "pdf";
      const filename = `${params.docType}-${params.dateBegin}-${params.dateEnd}.${fileExtension}`;

      // Make request with blob response type
      const response = await api.get(`/dashboard/intervention`, {
        params: {
          "doc-type": params.docType,
          "date-begin": params.dateBegin,
          "date-end": params.dateEnd,
        },
        responseType: "blob", // Important: request as blob
      });

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: isExcel
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });

      // Download the file
      downloadBlob(blob, filename);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download intervention report: ${errorMessage}`);
    }
  };

  return {
    // Query functions (async functions that refetch)
    getDashboard,
    getInterventionReport,

    // Query states (from reactive query)
    dashboardData: dashboardQuery.data,
    dashboardIsLoading: dashboardQuery.isLoading,
    dashboardError: dashboardQuery.error
      ? handleApiError(dashboardQuery.error)
      : null,

    // Direct access to query for advanced usage
    dashboardQuery,
  };
}

