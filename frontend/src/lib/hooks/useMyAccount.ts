import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { OccupantMyAccountResponse } from "./useOccupant";

/**
 * Hook dédié aux données "Mon compte" de l'occupant
 * GET /api/occupant/{fk}/my-account
 */
export function useMyAccount(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  const getMyAccountQuery = useQuery({
    queryKey: ["occupant", "my-account", fkUser],
    queryFn: async (): Promise<OccupantMyAccountResponse> => {
      const response = await api.get<OccupantMyAccountResponse>(
        `/occupant/${fkUser}/my-account`,
      );
      return extractApiData<OccupantMyAccountResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(),
    enabled: !!fkUser,
  });

  const getMyAccount = async (): Promise<OccupantMyAccountResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch account information");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "my-account", fkUser],
      queryFn: async (): Promise<OccupantMyAccountResponse> => {
        const response = await api.get<OccupantMyAccountResponse>(
          `/occupant/${fkUser}/my-account`,
        );
        return extractApiData<OccupantMyAccountResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });

    return result;
  };

  return {
    getMyAccount,
    getMyAccountQuery,
    myAccountData: getMyAccountQuery.data,
    myAccountIsLoading: getMyAccountQuery.isLoading,
    myAccountError: getMyAccountQuery.error
      ? handleApiError(getMyAccountQuery.error)
      : null,
  };
}


