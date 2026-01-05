import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { AnomalyListResponse } from "@/lib/types/api";

/**
 * Hook dédié aux anomalies de l'occupant
 * GET /api/occupant/{fk}/anomalies
 */
export function useAnomalies(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  const getAnomaliesQuery = (appareil?: string) =>
    useQuery({
      queryKey: ["occupant", "anomalies", fkUser, appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<AnomalyListResponse>(
          `/occupant/${fkUser}/anomalies`,
          { params },
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
      enabled: !!fkUser,
    });

  const getAnomalies = async (
    appareil?: string,
  ): Promise<AnomalyListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch anomalies");
    }

    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "anomalies", fkUser, appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/occupant/${fkUser}/anomalies`,
          { params },
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });

    return result;
  };

  /**
   * Export anomalies to CSV for current occupant
   * GET /api/occupant/{fk}/anomalies/export
   */
  const exportAnomalies = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export anomalies");
      }

      const response = await api.get("/occupant/anomalies/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-anomalies.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export anomalies: ${errorMessage}`);
    }
  };

  return {
    getAnomalies,
    getAnomaliesQuery,
    exportAnomalies,
  };
}


