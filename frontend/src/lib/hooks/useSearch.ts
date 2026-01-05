import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import type { Building, Housing, DashboardData, SearchParams } from "@/lib/types/api";

/**
 * Response from /api/search endpoint for immeubles
 */
export interface SearchImmeublesResponse {
  type: "immeuble";
  filters: Record<string, string>;
  results: Building[];
  count: number;
}

/**
 * Response from /api/search endpoint for occupants
 */
export interface SearchOccupantsResponse {
  type: "occupant";
  filters: Record<string, string>;
  results: Housing[];
  count: number;
}

/**
 * Response from /api/search endpoint (no type specified)
 */
export interface SearchDefaultResponse {
  board: DashboardData;
  message: string;
}

/**
 * Union type for search responses
 */
export type SearchResponse =
  | SearchImmeublesResponse
  | SearchOccupantsResponse
  | SearchDefaultResponse;

/**
 * Parameters for searching immeubles
 */
export interface SearchImmeublesParams {
  // Filters with minimum 1 character
  ref?: string;
  ref_numero?: string;
  // Filters with minimum 3 characters
  nom?: string;
  tout?: string;
  adresse?: string;
}

/**
 * Parameters for searching occupants
 */
export interface SearchOccupantsParams {
  // Filters with minimum 1 character
  ref?: string;
  ref_numero?: string;
  // Filters with minimum 3 characters
  nom?: string;
  tout?: string;
  adresse?: string;
  // Optional: filter by immeuble
  pkImmeuble?: string | number;
}

/**
 * Custom hook for Search API endpoints
 *
 * Provides search functionality for:
 * - Immeubles (buildings)
 * - Occupants (logements/housing units)
 *
 * The API validates filter lengths:
 * - ref, ref_numero: minimum 1 character
 * - nom, tout, adresse: minimum 3 characters
 *
 * @example
 * ```tsx
 * const { searchImmeubles, searchOccupants } = useSearch();
 *
 * // Search immeubles
 * const immeubles = await searchImmeubles({
 *   nom: "Rue de la Paix",
 *   adresse: "Paris",
 * });
 *
 * // Search occupants
 * const occupants = await searchOccupants({
 *   nom: "Dupont",
 *   pkImmeuble: "123",
 * });
 * ```
 */
export function useSearch() {
  const queryClient = useQueryClient();

  /**
   * Search immeubles query
   * GET /api/search?type=immeuble
   * @param params - Search parameters
   */
  const searchImmeublesQuery = (params?: SearchImmeublesParams) => {
    return useQuery({
      queryKey: ["search", "immeubles", params],
      queryFn: async (): Promise<SearchImmeublesResponse> => {
        const queryParams: any = { type: "immeuble" };

        // Add filters (API validates minimum lengths)
        if (params?.ref) queryParams.ref = params.ref;
        if (params?.ref_numero) queryParams.ref_numero = params.ref_numero;
        if (params?.nom) queryParams.nom = params.nom;
        if (params?.tout) queryParams.tout = params.tout;
        if (params?.adresse) queryParams.adresse = params.adresse;

        const response = await api.get<SearchImmeublesResponse>("/search", {
          params: queryParams,
        });
        return extractApiData<SearchImmeublesResponse>(response);
      },
      enabled: !!params && Object.keys(params).length > 0, // Only run if params provided
      retry: false,
      staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    });
  };

  /**
   * Search immeubles
   * @param params - Search parameters
   * @returns Promise with search results
   */
  const searchImmeubles = async (
    params: SearchImmeublesParams
  ): Promise<SearchImmeublesResponse> => {
    const queryParams: any = { type: "immeuble" };

    // Add filters
    if (params.ref) queryParams.ref = params.ref;
    if (params.ref_numero) queryParams.ref_numero = params.ref_numero;
    if (params.nom) queryParams.nom = params.nom;
    if (params.tout) queryParams.tout = params.tout;
    if (params.adresse) queryParams.adresse = params.adresse;

    const result = await queryClient.fetchQuery({
      queryKey: ["search", "immeubles", params],
      queryFn: async (): Promise<SearchImmeublesResponse> => {
        const response = await api.get<SearchImmeublesResponse>("/search", {
          params: queryParams,
        });
        return extractApiData<SearchImmeublesResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Search occupants query
   * GET /api/search?type=occupant
   * @param params - Search parameters
   */
  const searchOccupantsQuery = (params?: SearchOccupantsParams) => {
    return useQuery({
      queryKey: ["search", "occupants", params],
      queryFn: async (): Promise<SearchOccupantsResponse> => {
        const queryParams: any = { type: "occupant" };

        // Add filters
        if (params?.ref) queryParams.ref = params.ref;
        if (params?.ref_numero) queryParams.ref_numero = params.ref_numero;
        if (params?.nom) queryParams.nom = params.nom;
        if (params?.tout) queryParams.tout = params.tout;
        if (params?.adresse) queryParams.adresse = params.adresse;
        if (params?.pkImmeuble) queryParams.pkImmeuble = params.pkImmeuble;

        const response = await api.get<SearchOccupantsResponse>("/search", {
          params: queryParams,
        });
        return extractApiData<SearchOccupantsResponse>(response);
      },
      enabled: !!params && Object.keys(params).length > 0, // Only run if params provided
      retry: false,
      staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    });
  };

  /**
   * Search occupants
   * @param params - Search parameters
   * @returns Promise with search results
   */
  const searchOccupants = async (
    params: SearchOccupantsParams
  ): Promise<SearchOccupantsResponse> => {
    const queryParams: any = { type: "occupant" };

    // Add filters
    if (params.ref) queryParams.ref = params.ref;
    if (params.ref_numero) queryParams.ref_numero = params.ref_numero;
    if (params.nom) queryParams.nom = params.nom;
    if (params.tout) queryParams.tout = params.tout;
    if (params.adresse) queryParams.adresse = params.adresse;
    if (params.pkImmeuble) queryParams.pkImmeuble = params.pkImmeuble;

    const result = await queryClient.fetchQuery({
      queryKey: ["search", "occupants", params],
      queryFn: async (): Promise<SearchOccupantsResponse> => {
        const response = await api.get<SearchOccupantsResponse>("/search", {
          params: queryParams,
        });
        return extractApiData<SearchOccupantsResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Generic search mutation (can be used for both types)
   * GET /api/search
   * @param type - Search type ('immeuble' or 'occupant')
   * @param params - Search parameters
   */
  const searchMutation = useMutation({
    mutationFn: async ({
      type,
      params,
    }: {
      type: "immeuble" | "occupant";
      params: SearchImmeublesParams | SearchOccupantsParams;
    }): Promise<SearchImmeublesResponse | SearchOccupantsResponse> => {
      const queryParams: any = { type };

      // Add filters
      if ("ref" in params && params.ref) queryParams.ref = params.ref;
      if ("ref_numero" in params && params.ref_numero)
        queryParams.ref_numero = params.ref_numero;
      if ("nom" in params && params.nom) queryParams.nom = params.nom;
      if ("tout" in params && params.tout) queryParams.tout = params.tout;
      if ("adresse" in params && params.adresse)
        queryParams.adresse = params.adresse;
      if ("pkImmeuble" in params && params.pkImmeuble)
        queryParams.pkImmeuble = params.pkImmeuble;

      const response = await api.get<SearchImmeublesResponse | SearchOccupantsResponse>(
        "/search",
        {
          params: queryParams,
        }
      );
      return extractApiData<SearchImmeublesResponse | SearchOccupantsResponse>(response);
    },
  });

  /**
   * Generic search function
   * @param type - Search type ('immeuble' or 'occupant')
   * @param params - Search parameters
   * @returns Promise with search results
   */
  const search = async (
    type: "immeuble" | "occupant",
    params: SearchImmeublesParams | SearchOccupantsParams
  ): Promise<SearchImmeublesResponse | SearchOccupantsResponse> => {
    return searchMutation.mutateAsync({ type, params });
  };

  return {
    // Query functions (async functions that refetch)
    searchImmeubles,
    searchOccupants,
    search,

    // Mutation states
    isSearching: searchMutation.isPending,

    // Mutation errors
    searchError: searchMutation.error
      ? handleApiError(searchMutation.error)
      : null,

    // Query hooks for reactive usage (with parameters)
    searchImmeublesQuery,
    searchOccupantsQuery,

    // Direct access to mutations/queries for advanced usage
    searchMutation,
  };
}

