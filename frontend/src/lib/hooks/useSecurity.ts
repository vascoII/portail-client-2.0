import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import type {
  LoginResponse,
  User,
  UserRole,
} from "@/lib/types/api";

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Reset password request interface
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Update password request interface
 * Password can be a string or an object with first/second confirmation
 */
export interface UpdatePasswordRequest {
  password: string | { first: string; second: string };
}

/**
 * Response from reset password
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Response from update password
 */
export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Response from getMe endpoint
 */
export interface MeResponse {
  user: User;
  roles: UserRole[];
}

/**
 * Custom hook for Security API endpoints
 *
 * Provides all security-related API calls including:
 * - Login (standard and from param)
 * - Logout
 * - Password management (reset, update)
 * - User information (me)
 *
 * @example
 * ```tsx
 * const { login, logout, resetPassword, updatePassword, getMe } = useSecurity();
 *
 * // Login
 * await login({ username: "user@example.com", password: "password123" });
 *
 * // Reset password
 * await resetPassword({ email: "user@example.com" });
 *
 * // Update password
 * await updatePassword({ password: "newPassword123" });
 * ```
 */
export function useSecurity() {
  const queryClient = useQueryClient();

  /**
   * Login mutation
   * POST /api/security/login
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>("/security/login", {
        username: credentials.username,
        password: credentials.password,
      });
      return extractApiData<LoginResponse>(response);
    },
    onSuccess: () => {
      // Invalidate user info query to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ["security", "me"] });
    },
  });

  /**
   * Login from parameter mutation
   * GET /api/security/login/{param}
   * Used for special login links (e.g., email links)
   */
  const loginFromParamMutation = useMutation({
    mutationFn: async (param: string): Promise<LoginResponse> => {
      const response = await api.get<LoginResponse>(`/security/login/${param}`);
      return extractApiData<LoginResponse>(response);
    },
    onSuccess: () => {
      // Invalidate user info query to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ["security", "me"] });
    },
  });

  /**
   * Logout mutation
   * POST /api/security/logout
   */
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await api.post("/security/logout");
      } catch (error) {
        // Even if logout fails on server, we still want to clear local state
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
      // Invalidate user info query
      queryClient.invalidateQueries({ queryKey: ["security", "me"] });
    },
  });

  /**
   * Reset password mutation
   * POST /api/security/reset-password
   */
  const resetPasswordMutation = useMutation({
    mutationFn: async (
      request: ResetPasswordRequest
    ): Promise<ResetPasswordResponse> => {
      const response = await api.post<ResetPasswordResponse>(
        "/security/reset-password",
        {
          email: request.email,
        }
      );
      return extractApiData<ResetPasswordResponse>(response);
    },
  });

  /**
   * Update password mutation
   * PUT /api/security/update-password
   */
  const updatePasswordMutation = useMutation({
    mutationFn: async (
      request: UpdatePasswordRequest
    ): Promise<UpdatePasswordResponse> => {
      // Handle password format (string or object with first/second)
      const passwordData =
        typeof request.password === "string"
          ? { password: request.password }
          : { password: request.password };

      const response = await api.put<UpdatePasswordResponse>(
        "/security/update-password",
        passwordData
      );
      return extractApiData<UpdatePasswordResponse>(response);
    },
  });

  /**
   * Get current user information query
   * GET /api/security/me
   */
  const meQuery = useQuery({
    queryKey: ["security", "me"],
    queryFn: async (): Promise<MeResponse> => {
      const response = await api.get<MeResponse>("/security/me");
      return extractApiData<MeResponse>(response);
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    enabled: false, // Disabled by default, enable when needed
  });

  /**
   * Login function
   * @param credentials - Login credentials (username and password)
   * @returns Promise with login response
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return loginMutation.mutateAsync(credentials);
  };

  /**
   * Login from parameter function
   * @param param - Login parameter (from special login links)
   * @returns Promise with login response
   */
  const loginFromParam = async (param: string): Promise<LoginResponse> => {
    return loginFromParamMutation.mutateAsync(param);
  };

  /**
   * Logout function
   * @returns Promise that resolves when logout is complete
   */
  const logout = async (): Promise<void> => {
    return logoutMutation.mutateAsync();
  };

  /**
   * Reset password function
   * @param email - Email address for password reset
   * @returns Promise with reset password response
   */
  const resetPassword = async (
    email: string
  ): Promise<ResetPasswordResponse> => {
    return resetPasswordMutation.mutateAsync({ email });
  };

  /**
   * Update password function
   * @param password - New password (string or object with first/second for confirmation)
   * @returns Promise with update password response
   */
  const updatePassword = async (
    password: string | { first: string; second: string }
  ): Promise<UpdatePasswordResponse> => {
    return updatePasswordMutation.mutateAsync({ password });
  };

  /**
   * Get current user information
   * Refetches the me query
   * @returns Promise with user information
   */
  const getMe = async (): Promise<MeResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["security", "me"],
      queryFn: async (): Promise<MeResponse> => {
        const response = await api.get<MeResponse>("/security/me");
        return extractApiData<MeResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  return {
    // Mutations
    login,
    loginFromParam,
    logout,
    resetPassword,
    updatePassword,

    // Query functions (async functions that refetch)
    getMe,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingInFromParam: loginFromParamMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error
      ? handleApiError(loginMutation.error)
      : null,
    loginFromParamError: loginFromParamMutation.error
      ? handleApiError(loginFromParamMutation.error)
      : null,
    logoutError: logoutMutation.error
      ? handleApiError(logoutMutation.error)
      : null,
    resetPasswordError: resetPasswordMutation.error
      ? handleApiError(resetPasswordMutation.error)
      : null,
    updatePasswordError: updatePasswordMutation.error
      ? handleApiError(updatePasswordMutation.error)
      : null,

    // Query states (from reactive queries)
    meData: meQuery.data,
    meIsLoading: meQuery.isLoading,
    meError: meQuery.error ? handleApiError(meQuery.error) : null,

    // Direct access to mutations for advanced usage
    loginMutation,
    loginFromParamMutation,
    logoutMutation,
    resetPasswordMutation,
    updatePasswordMutation,

    // Direct access to queries for advanced usage
    meQuery,
  };
}

