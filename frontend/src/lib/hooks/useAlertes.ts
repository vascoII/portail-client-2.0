import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { OccupantAlertesResponse, UpdateAlertesParams } from "./useOccupant";

/**
 * Hook dédié à la configuration des alertes occupant
 * GET/POST /api/occupant/{fk}/alertes
 */
export function useAlertes(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  const alertesMutation = useMutation({
    mutationFn: async (
      params?: UpdateAlertesParams,
    ): Promise<OccupantAlertesResponse> => {
      if (!fkUser) {
        throw new Error("fkUser is required to update alerts");
      }

      if (params) {
        const data: any = { ...params };
        if (typeof data.SEUIL_CONSO_ACTIF === "boolean") {
          data.SEUIL_CONSO_ACTIF = data.SEUIL_CONSO_ACTIF ? "O" : "N";
        }

        const response = await api.post<OccupantAlertesResponse>(
          `/occupant/${fkUser}/alertes`,
          data,
        );
        return extractApiData<OccupantAlertesResponse>(response);
      }

      const response = await api.get<OccupantAlertesResponse>(
        `/occupant/${fkUser}/alertes`,
      );
      return extractApiData<OccupantAlertesResponse>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occupant", "logement"] });
      queryClient.invalidateQueries({ queryKey: ["occupant", "my-account"] });
      queryClient.invalidateQueries({ queryKey: ["occupant", "alertes"] });
    },
  });

  const getAlertes = async (): Promise<OccupantAlertesResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch alerts");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "alertes", fkUser],
      queryFn: async (): Promise<OccupantAlertesResponse> => {
        const response = await api.get<OccupantAlertesResponse>(
          `/occupant/${fkUser}/alertes`,
        );
        return extractApiData<OccupantAlertesResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });

    return result;
  };

  const getAlertesQuery = useQuery({
    queryKey: ["occupant", "alertes", fkUser],
    queryFn: async (): Promise<OccupantAlertesResponse> => {
      const response = await api.get<OccupantAlertesResponse>(
        `/occupant/${fkUser}/alertes`,
      );
      return extractApiData<OccupantAlertesResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(),
    enabled: !!fkUser,
  });

  const updateAlertes = async (
    params: UpdateAlertesParams,
  ): Promise<OccupantAlertesResponse> => {
    return alertesMutation.mutateAsync(params);
  };

  return {
    getAlertes,
    getAlertesQuery,
    updateAlertes,
    isUpdatingAlertes: alertesMutation.isPending,
    updateAlertesError: alertesMutation.error
      ? handleApiError(alertesMutation.error)
      : null,
    alertesData: getAlertesQuery.data,
    alertesIsLoading: getAlertesQuery.isLoading,
    alertesError: getAlertesQuery.error
      ? handleApiError(getAlertesQuery.error)
      : null,
  };
}


