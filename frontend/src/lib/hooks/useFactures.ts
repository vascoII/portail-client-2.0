import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { Invoice, InvoiceListResponse } from "@/lib/types/api";

/**
 * Response from /api/factures endpoint
 */
export interface FacturesListResponse {
  factures: Invoice[];
  count: number;
}

/**
 * Response from /api/factures/{pkFacture} endpoint
 */
export interface FactureDetailsResponse extends Invoice {}

/**
 * Custom hook for Factures (Invoices) API endpoints
 *
 * Provides all invoice-related API calls including:
 * - Listing invoices
 * - Getting invoice details
 * - Downloading invoice PDFs
 *
 * @example
 * ```tsx
 * const { getFactures, getFacture, downloadFacture } = useFactures();
 *
 * // Get invoices list
 * const factures = await getFactures();
 *
 * // Get invoice details
 * const facture = await getFacture("12345");
 *
 * // Download invoice PDF
 * await downloadFacture("12345");
 * ```
 */
export function useFactures() {
  const queryClient = useQueryClient();

  /**
   * Get invoices list query
   * GET /api/factures
   */
  const getFacturesQuery = useQuery({
    queryKey: ["factures"],
    queryFn: async (): Promise<FacturesListResponse> => {
      const response = await api.get<FacturesListResponse>("/factures");
      return extractApiData<FacturesListResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
  });

  /**
   * Get invoices list
   * @returns Promise with invoices list
   */
  const getFactures = async (): Promise<FacturesListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["factures"],
      queryFn: async (): Promise<FacturesListResponse> => {
        const response = await api.get<FacturesListResponse>("/factures");
        return extractApiData<FacturesListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get invoice details query
   * GET /api/factures/{pkFacture}
   * @param pkFacture - Invoice ID
   */
  const getFactureQuery = (pkFacture: string | number) => {
    return useQuery({
      queryKey: ["factures", pkFacture],
      queryFn: async (): Promise<FactureDetailsResponse> => {
        const response = await api.get<FactureDetailsResponse>(
          `/factures/${pkFacture}`
        );
        return extractApiData<FactureDetailsResponse>(response);
      },
      enabled: !!pkFacture,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get invoice details
   * @param pkFacture - Invoice ID
   * @returns Promise with invoice details
   */
  const getFacture = async (
    pkFacture: string | number
  ): Promise<FactureDetailsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["factures", pkFacture],
      queryFn: async (): Promise<FactureDetailsResponse> => {
        const response = await api.get<FactureDetailsResponse>(
          `/factures/${pkFacture}`
        );
        return extractApiData<FactureDetailsResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Helper function to download a blob (PDF)
   * @param blob The Blob object to download
   * @param filename The desired filename
   * @param contentType The content type of the blob
   */
  const downloadBlob = (blob: Blob, filename: string, contentType: string) => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Download invoice PDF
   * GET /api/factures/{pkFacture}/download
   * @param pkFacture - Invoice ID
   * @returns Promise that resolves when download is complete
   */
  const downloadFacture = async (pkFacture: string | number): Promise<void> => {
    try {
      const response = await api.get<Blob>(`/factures/${pkFacture}/download`, {
        responseType: "blob", // Important for downloading files
      });

      const contentType =
        response.headers["content-type"] || "application/pdf";
      const filename =
        response.headers["content-disposition"]?.split("filename=")[1]?.replace(/['"]/g, "") ||
        `facture-${pkFacture}-${new Date()
          .toLocaleDateString("fr-FR")
          .replace(/\//g, "-")}.pdf`;

      downloadBlob(response.data, filename, contentType);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  return {
    // Query functions (async functions that refetch)
    getFactures,
    getFacture,

    // Helper functions for downloads
    downloadFacture,

    // Query states (from reactive queries)
    facturesData: getFacturesQuery.data,
    facturesIsLoading: getFacturesQuery.isLoading,
    facturesError: getFacturesQuery.error
      ? handleApiError(getFacturesQuery.error)
      : null,

    // Query hooks for reactive usage (with parameters)
    getFactureQuery,

    // Direct access to queries for advanced usage
    getFacturesQuery,
  };
}

