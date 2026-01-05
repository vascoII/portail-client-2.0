import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import type {
  Operator,
  OperatorListResponse,
  CreateOperatorRequest,
  UpdateOperatorRequest,
  UpdatePasswordRequest,
  Building,
  OccupantStatistics,
} from "@/lib/types/api";

/**
 * Response from /api/operators endpoint
 */
export interface OperatorsListResponse {
  users: Operator[];
}

/**
 * Response from /api/operators/statistiques endpoint
 */
export interface OperatorsStatsResponse {
  stats: OccupantStatistics;
}

/**
 * Response from /api/operators/{id} endpoint
 */
export interface OperatorDetailsResponse {
  user: Operator;
  immeubles: Building[];
  diffImmeubles: Building[]; // Available immeubles not assigned to this operator
}

/**
 * Response from add/remove buildings
 */
export interface OperatorBuildingsResponse {
  immeubles: Building[];
  diffImmeubles?: Building[]; // Only in remove response
}

/**
 * Parameters for adding buildings
 */
export interface AddBuildingsParams {
  immeubles?: (string | number)[]; // Array of building IDs
  all?: boolean; // If true, assign all available buildings
}

/**
 * Parameters for removing buildings
 */
export interface RemoveBuildingsParams {
  immeubles?: (string | number)[]; // Array of building IDs to remove
  all?: boolean; // If true, remove all buildings
}

/**
 * Custom hook for Operators (Gestionnaires) API endpoints
 *
 * Provides all operator-related API calls including:
 * - Operator list and details
 * - Create, update, delete operators
 * - Password management
 * - Building assignment management
 * - Statistics
 *
 * @example
 * ```tsx
 * const { getOperators, createOperator, updateOperator, addBuildings } = useOperators();
 *
 * // Get operators list
 * const operators = await getOperators();
 *
 * // Create operator
 * await createOperator({
 *   job: "Manager",
 *   lastname: "Doe",
 *   firstname: "John",
 *   phone: "0123456789",
 *   email: "john@example.com",
 * });
 *
 * // Add buildings to operator
 * await addBuildings("123", { immeubles: ["456", "789"] });
 * ```
 */
export function useOperators() {
  const queryClient = useQueryClient();

  /**
   * Get operators list query
   * GET /api/operators
   */
  const getOperatorsQuery = useQuery({
    queryKey: ["operators"],
    queryFn: async (): Promise<OperatorsListResponse> => {
      const response = await api.get<OperatorsListResponse>("/operators");
      return extractApiData<OperatorsListResponse>(response);
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });

  /**
   * Get operators list
   * @returns Promise with operators list
   */
  const getOperators = async (): Promise<OperatorsListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["operators"],
      queryFn: async (): Promise<OperatorsListResponse> => {
        const response = await api.get<OperatorsListResponse>("/operators");
        return extractApiData<OperatorsListResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Create operator mutation
   * POST /api/operators
   * @param data - Operator data
   */
  const createOperatorMutation = useMutation({
    mutationFn: async (
      data: CreateOperatorRequest
    ): Promise<{ success: boolean; message?: string }> => {
      // Handle email format (can be string or object with first/second)
      const requestData: any = { ...data };
      if (typeof data.email === "object" && "first" in data.email) {
        // Email is already in the correct format
      } else if (typeof data.email === "string") {
        // Convert string email to object format if needed
        requestData.email = { first: data.email, second: data.email };
      }

      const response = await api.post("/operators", requestData);
      const apiResponse = response.data;

      if (apiResponse.success) {
        return {
          success: true,
          message: apiResponse.message,
        };
      }

      throw new Error(
        apiResponse.message || "Une erreur s'est produite lors de la création du gestionnaire."
      );
    },
    onSuccess: () => {
      // Invalidate operators list so /gestionnaire is refreshed
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  /**
   * Create operator
   * @param data - Operator data
   * @returns Promise with creation result
   */
  const createOperator = async (
    data: CreateOperatorRequest
  ): Promise<{ success: boolean; message?: string }> => {
    return createOperatorMutation.mutateAsync(data);
  };

  /**
   * Get operator statistics query
   * GET /api/operators/statistiques
   */
  const getStatisticsQuery = useQuery({
    queryKey: ["operators", "statistiques"],
    queryFn: async (): Promise<OperatorsStatsResponse> => {
      const response = await api.get<OperatorsStatsResponse>(
        "/operators/statistiques"
      );
      return extractApiData<OperatorsStatsResponse>(response);
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    enabled: false, // Disabled by default
  });

  /**
   * Get operator statistics
   * @returns Promise with statistics
   */
  const getStatistics = useCallback(async (): Promise<OperatorsStatsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["operators", "statistiques"],
      queryFn: async (): Promise<OperatorsStatsResponse> => {
        const response = await api.get<OperatorsStatsResponse>(
          "/operators/statistiques"
        );
        return extractApiData<OperatorsStatsResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  }, [queryClient]);

  /**
   * Get operator details query
   * GET /api/operators/{id}
   * @param id - Operator ID
   * Note: No cache enabled (staleTime: 0) to always fetch fresh data
   */
  const getOperatorQuery = (id: string | number) => {
    return useQuery({
      queryKey: ["operators", id],
      queryFn: async (): Promise<OperatorDetailsResponse> => {
        const response = await api.get<OperatorDetailsResponse>(
          `/operators/${id}`
        );
        return extractApiData<OperatorDetailsResponse>(response);
      },
      enabled: !!id,
      retry: false,
      staleTime: 0, // No cache - always fetch fresh data
      gcTime: 0, // Don't keep in cache after unmount
    });
  };

  /**
   * Get operator details
   * @param id - Operator ID
   * @returns Promise with operator details
   * Note: No cache enabled (staleTime: 0) to always fetch fresh data
   */
  const getOperator = async (
    id: string | number
  ): Promise<OperatorDetailsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["operators", id],
      queryFn: async (): Promise<OperatorDetailsResponse> => {
        const response = await api.get<OperatorDetailsResponse>(
          `/operators/${id}`
        );
        return extractApiData<OperatorDetailsResponse>(response);
      },
      retry: false,
      staleTime: 0, // No cache - always fetch fresh data
      gcTime: 0, // Don't keep in cache after unmount
    });
    return result;
  };

  /**
   * Update operator mutation
   * PUT/PATCH /api/operators/{id}
   * @param id - Operator ID
   * @param data - Operator data
   */
  const updateOperatorMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateOperatorRequest;
    }): Promise<{ success: boolean; message?: string }> => {
      // Handle email format (can be string or object with first/second)
      const requestData: any = { ...data };
      if (data.email) {
        if (typeof data.email === "object" && "first" in data.email) {
          // Email is already in the correct format
        } else if (typeof data.email === "string") {
          // Keep as string, API will handle it
        }
      }

      const response = await api.put(`/operators/${id}`, requestData);
      const apiResponse = response.data;

      if (apiResponse.success) {
        return {
          success: true,
          message: apiResponse.message,
        };
      }

      throw new Error(
        apiResponse.message || "Une erreur s'est produite lors de la mise à jour du gestionnaire."
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate operator details and list
      queryClient.invalidateQueries({ queryKey: ["operators", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  /**
   * Update operator
   * @param id - Operator ID
   * @param data - Operator data
   * @returns Promise with update result
   */
  const updateOperator = async (
    id: string | number,
    data: UpdateOperatorRequest
  ): Promise<{ success: boolean; message?: string }> => {
    return updateOperatorMutation.mutateAsync({ id, data });
  };

  /**
   * Update operator password mutation
   * PUT/PATCH /api/operators/{id}/password
   * @param id - Operator ID
   * @param password - Password (can be string or object with first/second)
   */
  const updatePasswordMutation = useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: string | number;
      password: string | { first: string; second: string };
    }): Promise<{ success: boolean; message?: string }> => {
      // Handle password format (can be string or object with first/second)
      const requestData: any = {};
      if (typeof password === "object" && "first" in password) {
        requestData.password = password;
      } else if (typeof password === "string") {
        requestData.password = password;
      } else {
        throw new Error("Invalid password format");
      }

      const response = await api.put(`/operators/${id}/password`, requestData);
      return extractApiData(response);
    },
    onSuccess: () => {
      // Invalidate operators list (password change doesn't affect details)
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  /**
   * Update operator password
   * @param id - Operator ID
   * @param password - Password (can be string or object with first/second)
   * @returns Promise with update result
   */
  const updatePassword = async (
    id: string | number,
    password: string | { first: string; second: string }
  ): Promise<{ success: boolean; message?: string }> => {
    return updatePasswordMutation.mutateAsync({ id, password });
  };

  /**
   * Add buildings to operator mutation
   * POST /api/operators/{id}/immeubles
   * @param id - Operator ID
   * @param params - Buildings parameters
   */
  const addBuildingsMutation = useMutation({
    mutationFn: async ({
      id,
      params,
    }: {
      id: string | number;
      params: AddBuildingsParams;
    }): Promise<OperatorBuildingsResponse> => {
      const requestData: any = {};
      if (params.all) {
        requestData.all = "1";
      } else if (params.immeubles) {
        requestData.immeubles = JSON.stringify(params.immeubles);
      }

      const response = await api.post<OperatorBuildingsResponse>(
        `/operators/${id}/immeubles`,
        requestData
      );
      return extractApiData<OperatorBuildingsResponse>(response);
    },
    onSuccess: (_, variables) => {
      // Invalidate operator details to refresh building list
      queryClient.invalidateQueries({ queryKey: ["operators", variables.id] });
    },
  });

  /**
   * Add buildings to operator
   * @param id - Operator ID
   * @param params - Buildings parameters
   * @returns Promise with updated buildings list
   */
  const addBuildings = async (
    id: string | number,
    params: AddBuildingsParams
  ): Promise<OperatorBuildingsResponse> => {
    return addBuildingsMutation.mutateAsync({ id, params });
  };

  /**
   * Remove buildings from operator mutation
   * DELETE /api/operators/{id}/immeubles
   * @param id - Operator ID
   * @param params - Buildings parameters
   */
  const removeBuildingsMutation = useMutation({
    mutationFn: async ({
      id,
      params,
    }: {
      id: string | number;
      params: RemoveBuildingsParams;
    }): Promise<OperatorBuildingsResponse> => {
      const requestData: any = {};
      if (params.all) {
        requestData.all = "1";
      } else if (params.immeubles) {
        requestData.immeubles = JSON.stringify(params.immeubles);
      }

      const response = await api.delete<OperatorBuildingsResponse>(
        `/operators/${id}/immeubles`,
        { data: requestData }
      );
      return extractApiData<OperatorBuildingsResponse>(response);
    },
    onSuccess: (_, variables) => {
      // Invalidate operator details to refresh building list
      queryClient.invalidateQueries({ queryKey: ["operators", variables.id] });
    },
  });

  /**
   * Remove buildings from operator
   * @param id - Operator ID
   * @param params - Buildings parameters
   * @returns Promise with updated buildings list
   */
  const removeBuildings = async (
    id: string | number,
    params: RemoveBuildingsParams
  ): Promise<OperatorBuildingsResponse> => {
    return removeBuildingsMutation.mutateAsync({ id, params });
  };

  /**
   * Delete operator mutation
   * DELETE /api/operators/{id}
   * @param id - Operator ID
   */
  const deleteOperatorMutation = useMutation({
    mutationFn: async (
      id: string | number
    ): Promise<{ success: boolean; message?: string }> => {
      const response = await api.delete(`/operators/${id}`);
      return extractApiData(response);
    },
    onSuccess: () => {
      // Invalidate operators list
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  /**
   * Delete operator
   * @param id - Operator ID
   * @returns Promise with deletion result
   */
  const deleteOperator = async (
    id: string | number
  ): Promise<{ success: boolean; message?: string }> => {
    return deleteOperatorMutation.mutateAsync(id);
  };

  return {
    // Query functions (async functions that refetch)
    getOperators,
    getStatistics,
    getOperator,

    // Mutation functions
    createOperator,
    updateOperator,
    updatePassword,
    addBuildings,
    removeBuildings,
    deleteOperator,

    // Mutation states
    isCreating: createOperatorMutation.isPending,
    isUpdating: updateOperatorMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isAddingBuildings: addBuildingsMutation.isPending,
    isRemovingBuildings: removeBuildingsMutation.isPending,
    isDeleting: deleteOperatorMutation.isPending,

    // Mutation errors
    createError: createOperatorMutation.error
      ? handleApiError(createOperatorMutation.error)
      : null,
    updateError: updateOperatorMutation.error
      ? handleApiError(updateOperatorMutation.error)
      : null,
    updatePasswordError: updatePasswordMutation.error
      ? handleApiError(updatePasswordMutation.error)
      : null,
    addBuildingsError: addBuildingsMutation.error
      ? handleApiError(addBuildingsMutation.error)
      : null,
    removeBuildingsError: removeBuildingsMutation.error
      ? handleApiError(removeBuildingsMutation.error)
      : null,
    deleteError: deleteOperatorMutation.error
      ? handleApiError(deleteOperatorMutation.error)
      : null,

    // Query states (from reactive queries)
    operatorsData: getOperatorsQuery.data,
    operatorsIsLoading: getOperatorsQuery.isLoading,
    operatorsError: getOperatorsQuery.error
      ? handleApiError(getOperatorsQuery.error)
      : null,

    statisticsData: getStatisticsQuery.data,
    statisticsIsLoading: getStatisticsQuery.isLoading,
    statisticsError: getStatisticsQuery.error
      ? handleApiError(getStatisticsQuery.error)
      : null,

    // Query hooks for reactive usage (with parameters)
    getOperatorQuery,

    // Direct access to mutations/queries for advanced usage
    createOperatorMutation,
    updateOperatorMutation,
    updatePasswordMutation,
    addBuildingsMutation,
    removeBuildingsMutation,
    deleteOperatorMutation,
    getOperatorsQuery,
    getStatisticsQuery,
  };
}

