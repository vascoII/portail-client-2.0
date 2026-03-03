import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Building, Housing, DashboardData, SearchParams as _SearchParams } from "@/lib/types/api";

/**
 * Response from /api/search endpoint for immeubles
 * Matches backend `json_response.txt` -> data.immeubles: Building[]
 */
export interface SearchImmeublesResponse {
  immeubles: Building[];
}

/**
 * Response from /api/search endpoint for occupants
 * Matches backend `json_response.txt` -> data.logement: Housing[]
 */
export interface SearchOccupantsResponse {
  logement: Housing[];
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
   * POST /api/search (type = immeuble)
   * @param params - Search parameters
   */
  const useSearchImmeublesQuery = (params?: SearchImmeublesParams) => {
    return useQuery({
      queryKey: ["search", "immeubles", params],
      queryFn: async (): Promise<SearchImmeublesResponse> => {
        const body: any = { type: "immeuble" }; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Add filters (API validates minimum lengths)
        if (params?.ref) body.ref = params.ref;
        if (params?.ref_numero) body.ref_numero = params.ref_numero;
        if (params?.nom) body.nom = params.nom;
        if (params?.tout) body.tout = params.tout;
        if (params?.adresse) body.adresse = params.adresse;

        const response = await api.post<SearchImmeublesResponse>(
          "/search",
          body,
        );
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
    const body: any = { type: "immeuble" }; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Add filters
    if (params.ref) body.ref = params.ref;
    if (params.ref_numero) body.ref_numero = params.ref_numero;
    if (params.nom) body.nom = params.nom;
    if (params.tout) body.tout = params.tout;
    if (params.adresse) body.adresse = params.adresse;

    const result = await queryClient.fetchQuery({
      queryKey: ["search", "immeubles", params],
      queryFn: async (): Promise<SearchImmeublesResponse> => {
        const response = await api.post<SearchImmeublesResponse>(
          "/search",
          body,
        );
        return extractApiData<SearchImmeublesResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Search occupants query
   * POST /api/search (type = occupant)
   * @param params - Search parameters
   */
  const useSearchOccupantsQuery = (params?: SearchOccupantsParams) => {
    return useQuery({
      queryKey: ["search", "occupants", params],
      queryFn: async (): Promise<SearchOccupantsResponse> => {
        const body: any = { type: "occupant" }; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Add filters
        if (params?.ref) body.ref = params.ref;
        if (params?.ref_numero) body.ref_numero = params.ref_numero;
        if (params?.nom) body.nom = params.nom;
        if (params?.tout) body.tout = params.tout;
        if (params?.adresse) body.adresse = params.adresse;
        if (params?.pkImmeuble) body.pkImmeuble = params.pkImmeuble;

        const response = await api.post<SearchOccupantsResponse>(
          "/search",
          body,
        );
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
    const body: any = { type: "occupant" }; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Add filters
    if (params.ref) body.ref = params.ref;
    if (params.ref_numero) body.ref_numero = params.ref_numero;
    if (params.nom) body.nom = params.nom;
    if (params.tout) body.tout = params.tout;
    if (params.adresse) body.adresse = params.adresse;
    if (params.pkImmeuble) body.pkImmeuble = params.pkImmeuble;

    const result = await queryClient.fetchQuery({
      queryKey: ["search", "occupants", params],
      queryFn: async (): Promise<SearchOccupantsResponse> => {
        const response = await api.post<SearchOccupantsResponse>(
          "/search",
          body,
        );
        return extractApiData<SearchOccupantsResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Generic search mutation (can be used for both types)
   * POST /api/search
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
      const body: any = { type }; // eslint-disable-line @typescript-eslint/no-explicit-any

      // Add filters
      if ("ref" in params && params.ref) body.ref = params.ref;
      if ("ref_numero" in params && params.ref_numero)
        body.ref_numero = params.ref_numero;
      if ("nom" in params && params.nom) body.nom = params.nom;
      if ("tout" in params && params.tout) body.tout = params.tout;
      if ("adresse" in params && params.adresse)
        body.adresse = params.adresse;
      if ("pkImmeuble" in params && params.pkImmeuble)
        body.pkImmeuble = params.pkImmeuble;

      const response = await api.post<
        SearchImmeublesResponse | SearchOccupantsResponse
      >("/search", body);
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
    useSearchImmeublesQuery,
    useSearchOccupantsQuery,

    // Direct access to mutations/queries for advanced usage
    searchMutation,
  };
}

