import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { DysfunctionListResponse } from "@/lib/types/api";

/**
 * Hook dédié aux dysfonctionnements de l'occupant
 * GET /api/occupant/{fk}/dysfonctionnements
 */
export function useDysfonctionnements(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  const getDysfonctionnementsQuery = useQuery({
    queryKey: ["occupant", "dysfonctionnements", fkUser],
    queryFn: async (): Promise<DysfunctionListResponse> => {
      const response = await api.get<DysfunctionListResponse>(
        `/occupant/${fkUser}/dysfonctionnements`,
      );
      return extractApiData<DysfunctionListResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(),
    enabled: !!fkUser,
  });

  const getDysfonctionnements =
    async (): Promise<DysfunctionListResponse> => {
      if (!fkUser) {
        throw new Error("fkUser is required to fetch dysfunctions");
      }

      const result = await queryClient.fetchQuery({
        queryKey: ["occupant", "dysfonctionnements", fkUser],
        queryFn: async (): Promise<DysfunctionListResponse> => {
          const response = await api.get<DysfunctionListResponse>(
            `/occupant/${fkUser}/dysfonctionnements`,
          );
          return extractApiData<DysfunctionListResponse>(response);
        },
        retry: false,
        staleTime: getStaleTimeUntilMidnight(),
      });

      return result;
    };

  /**
   * Export dysfunctions to CSV for current occupant
   * GET /api/occupant/{fk}/dysfonctionnements/export
   */
  const exportDysfonctionnements = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export dysfunctions");
      }

      const response = await api.get(
        "/occupant/dysfonctionnements/export",
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-autres-dysfonctionnemnts.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export dysfunctions: ${errorMessage}`);
    }
  };

  return {
    getDysfonctionnements,
    getDysfonctionnementsQuery,
    exportDysfonctionnements,
    dysfonctionnementsData: getDysfonctionnementsQuery.data,
    dysfonctionnementsIsLoading: getDysfonctionnementsQuery.isLoading,
    dysfonctionnementsError: getDysfonctionnementsQuery.error
      ? handleApiError(getDysfonctionnementsQuery.error)
      : null,
  };
}


