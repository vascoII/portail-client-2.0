import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { LeakListResponse } from "@/lib/types/api";

/**
 * Hook dédié aux fuites de l'occupant
 * GET /api/occupant/{fk}/fuites
 */
export function useFuites(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  const getFuitesQuery = (appareil?: string) =>
    useQuery({
      queryKey: ["occupant", "fuites", fkUser, appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<LeakListResponse>(
          `/occupant/${fkUser}/fuites`,
          { params },
        );
        return extractApiData<LeakListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
      enabled: !!fkUser,
    });

  const getFuites = async (appareil?: string): Promise<LeakListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch leaks");
    }

    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "fuites", fkUser, appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/occupant/${fkUser}/fuites`,
          { params },
        );
        return extractApiData<LeakListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });

    return result;
  };

  /**
   * Export leaks to CSV for current occupant
   * GET /api/occupant/{fk}/fuites/export
   */
  const exportFuites = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export leaks");
      }

      const response = await api.get("/occupant/fuites/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-fuites.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export leaks: ${errorMessage}`);
    }
  };

  return {
    getFuites,
    getFuitesQuery,
    exportFuites,
  };
}


