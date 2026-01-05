import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  UserInfo,
  LegalNotices,
  PersonalDataResponse,
  CGUStatusResponse,
  CGUValidationRequest,
  DashboardResponse,
} from "@/lib/types/api";

/**
 * Response from /api/me endpoint
 */
export interface MeResponse {
  user: UserInfo;
}

/**
 * Response from /api/legal-notices endpoint
 */
export interface LegalNoticesResponse {
  legalNotices: LegalNotices;
}

/**
 * Response from /api/cgu/status endpoint
 * Note: The API returns cguAccepted and email, but we normalize it to needsValidation
 */
export interface CGUStatusApiResponse {
  typeUser: string | null;
  cguAccepted: boolean;
  email: string | null;
}

/**
 * Response from /api/cgu/accept endpoint
 */
export interface CGUAcceptResponse {
  message: string;
  email: string;
}

/**
 * Response from /api/dashboard endpoint
 */
export interface DashboardApiResponse {
  dashboard: any; // DashboardData normalized
}

/**
 * Custom hook for Front API endpoints
 *
 * Provides all front/general API calls including:
 * - User information (me)
 * - Legal notices
 * - Personal data (subcontractors)
 * - CGU (Terms and Conditions) management
 * - Dashboard information
 *
 * @example
 * ```tsx
 * const { getMe, getLegalNotices, getPersonalDatas, getCGUStatus, acceptCGU, getDashboard } = useFront();
 *
 * // Get current user info
 * const userInfo = await getMe();
 *
 * // Get legal notices
 * const { legalNotices } = await getLegalNotices();
 *
 * // Accept CGU
 * await acceptCGU({
 *   email: "user@example.com",
 *   email_confirm: "user@example.com",
 *   valid_cgu: true,
 * });
 * ```
 */
export function useFront() {
  const queryClient = useQueryClient();

  /**
   * Get current user information query
   * GET /api/me
   */
  const meQuery = useQuery({
    queryKey: ["front", "me"],
    queryFn: async (): Promise<MeResponse> => {
      const response = await api.get<MeResponse>("/me");
      return extractApiData<MeResponse>(response);
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  /**
   * Get legal notices query
   * GET /api/legal-notices
   */
  const legalNoticesQuery = useQuery({
    queryKey: ["front", "legal-notices"],
    queryFn: async (): Promise<LegalNoticesResponse> => {
      const response = await api.get<LegalNoticesResponse>("/legal-notices");
      return extractApiData<LegalNoticesResponse>(response);
    },
    retry: false,
    staleTime: 60 * 60 * 1000, // Consider fresh for 1 hour (static content)
  });

  /**
   * Get personal data (subcontractors) query
   * GET /api/personal-datas
   */
  const personalDatasQuery = useQuery({
    queryKey: ["front", "personal-datas"],
    queryFn: async (): Promise<PersonalDataResponse> => {
      const response = await api.get<PersonalDataResponse>("/personal-datas");
      return extractApiData<PersonalDataResponse>(response);
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
  });

  /**
   * Get CGU status query
   * GET /api/cgu/status
   */
  const cguStatusQuery = useQuery({
    queryKey: ["front", "cgu", "status"],
    queryFn: async (): Promise<CGUStatusResponse> => {
      const response = await api.get<CGUStatusApiResponse>("/cgu/status");
      const data = extractApiData<CGUStatusApiResponse>(response);
      
      // Normalize API response to match CGUStatusResponse type
      return {
        typeUser: data.typeUser,
        needsValidation: !data.cguAccepted, // needsValidation is the inverse of cguAccepted
      };
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  /**
   * Get dashboard information query
   * GET /api/dashboard
   */
  const dashboardQuery = useQuery({
    queryKey: ["front", "dashboard"],
    queryFn: async (): Promise<DashboardResponse> => {
      const response = await api.get<DashboardApiResponse>("/dashboard");
      const data = extractApiData<DashboardApiResponse>(response);
      
      // Normalize to DashboardResponse format
      return {
        board: data.dashboard,
        chantier: undefined, // Will be populated by the dashboard endpoint if needed
        demo: false,
      };
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
  });

  /**
   * Accept CGU mutation
   * POST /api/cgu/accept
   */
  const acceptCGUMutation = useMutation({
    mutationFn: async (
      data: CGUValidationRequest
    ): Promise<CGUAcceptResponse> => {
      const response = await api.post<CGUAcceptResponse>("/cgu/accept", {
        email: data.email,
        email_confirm: data.email_confirm,
        valid_cgu: data.valid_cgu,
      });
      return extractApiData<CGUAcceptResponse>(response);
    },
    onSuccess: () => {
      // Invalidate CGU status query to refresh the status
      queryClient.invalidateQueries({ queryKey: ["front", "cgu", "status"] });
      // Also invalidate user info as email might have changed
      queryClient.invalidateQueries({ queryKey: ["front", "me"] });
    },
  });

  /**
   * Get current user information
   * Refetches the me query
   * @returns Promise with user information
   */
  const getMe = async (): Promise<MeResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["front", "me"],
      queryFn: async (): Promise<MeResponse> => {
        const response = await api.get<MeResponse>("/me");
        return extractApiData<MeResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get legal notices
   * Refetches the legal notices query
   * @returns Promise with legal notices
   */
  const getLegalNotices = async (): Promise<LegalNoticesResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["front", "legal-notices"],
      queryFn: async (): Promise<LegalNoticesResponse> => {
        const response = await api.get<LegalNoticesResponse>("/legal-notices");
        return extractApiData<LegalNoticesResponse>(response);
      },
      retry: false,
      staleTime: 60 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get personal data (subcontractors)
   * Refetches the personal datas query
   * @returns Promise with personal data
   */
  const getPersonalDatas = async (): Promise<PersonalDataResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["front", "personal-datas"],
      queryFn: async (): Promise<PersonalDataResponse> => {
        const response = await api.get<PersonalDataResponse>("/personal-datas");
        return extractApiData<PersonalDataResponse>(response);
      },
      retry: false,
      staleTime: 10 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get CGU status
   * Refetches the CGU status query
   * @returns Promise with CGU status
   */
  const getCGUStatus = async (): Promise<CGUStatusResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["front", "cgu", "status"],
      queryFn: async (): Promise<CGUStatusResponse> => {
        const response = await api.get<CGUStatusApiResponse>("/cgu/status");
        const data = extractApiData<CGUStatusApiResponse>(response);
        
        return {
          typeUser: data.typeUser,
          needsValidation: !data.cguAccepted,
        };
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get dashboard information
   * Refetches the dashboard query
   * @returns Promise with dashboard data
   */
  const getDashboard = async (): Promise<DashboardResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["front", "dashboard"],
      queryFn: async (): Promise<DashboardResponse> => {
        const response = await api.get<DashboardApiResponse>("/dashboard");
        const data = extractApiData<DashboardApiResponse>(response);
        
        return {
          board: data.dashboard,
          chantier: undefined,
          demo: false,
        };
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
    return result;
  };

  /**
   * Accept CGU and update email
   * @param data - CGU validation data (email, email_confirm, valid_cgu)
   * @returns Promise with accept response
   */
  const acceptCGU = async (
    data: CGUValidationRequest
  ): Promise<CGUAcceptResponse> => {
    return acceptCGUMutation.mutateAsync(data);
  };

  return {
    // Query functions (async functions that refetch)
    getMe,
    getLegalNotices,
    getPersonalDatas,
    getCGUStatus,
    getDashboard,

    // Mutations
    acceptCGU,

    // Mutation states
    isAcceptingCGU: acceptCGUMutation.isPending,

    // Mutation errors
    acceptCGUError: acceptCGUMutation.error
      ? handleApiError(acceptCGUMutation.error)
      : null,

    // Query states (from reactive queries)
    meData: meQuery.data,
    meIsLoading: meQuery.isLoading,
    meError: meQuery.error ? handleApiError(meQuery.error) : null,

    legalNoticesData: legalNoticesQuery.data,
    legalNoticesIsLoading: legalNoticesQuery.isLoading,
    legalNoticesError: legalNoticesQuery.error
      ? handleApiError(legalNoticesQuery.error)
      : null,

    personalDatasData: personalDatasQuery.data,
    personalDatasIsLoading: personalDatasQuery.isLoading,
    personalDatasError: personalDatasQuery.error
      ? handleApiError(personalDatasQuery.error)
      : null,

    cguStatusData: cguStatusQuery.data,
    cguStatusIsLoading: cguStatusQuery.isLoading,
    cguStatusError: cguStatusQuery.error
      ? handleApiError(cguStatusQuery.error)
      : null,

    dashboardData: dashboardQuery.data,
    dashboardIsLoading: dashboardQuery.isLoading,
    dashboardError: dashboardQuery.error
      ? handleApiError(dashboardQuery.error)
      : null,

    // Direct access to mutations for advanced usage
    acceptCGUMutation,

    // Direct access to queries for advanced usage
    meQuery,
    legalNoticesQuery,
    personalDatasQuery,
    cguStatusQuery,
    dashboardQuery,
  };
}

