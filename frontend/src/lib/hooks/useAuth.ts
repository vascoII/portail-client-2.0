import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useSecurity } from "@/lib/hooks/useSecurity";
import { handleApiError } from "@/lib/api/client";
import type { LoginCredentials } from "@/lib/hooks/useSecurity";

/**
 * Custom hook for authentication
 * 
 * High-level hook that provides authentication state and methods for login, logout, and session management.
 * This hook wraps `useSecurity` and adds:
 * - Zustand store integration for persistent state
 * - Automatic redirection after login/logout
 * - Local state management (stateless - no server check needed)
 * 
 * For advanced use cases (reset password, update password, etc.), use `useSecurity` directly.
 * 
 * @example
 * ```tsx
 * const { login, logout, isAuthenticated, isLoading, error } = useAuth();
 * 
 * // Login with automatic redirection
 * await login({ username: "user@example.com", password: "password123" });
 * // → Automatically redirects to /dashboard or /occupant based on role
 * 
 * // Logout with automatic cleanup and redirection
 * await logout();
 * // → Clears store, queries, and redirects to /login
 * ```
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use useSecurity for all API calls
  const security = useSecurity();
  
  // Zustand store for persistent state
  const {
    user,
    roles,
    sessionId,
    pkUser,
    isAuthenticated,
    isLoading: storeLoading,
    error: storeError,
    _hasHydrated,
    setUser,
    setLoading,
    setError,
    clearAuth,
    hasRole,
    hasAnyRole,
  } = useAuthStore();

  // Set hydrated flag after component mounts (client-side only)
  // This ensures the flag is set even if onRehydrateStorage doesn't work correctly
  useEffect(() => {
    if (typeof window !== 'undefined' && !_hasHydrated) {
      // Small delay to ensure localStorage is read
      const timer = setTimeout(() => {
        useAuthStore.setState({ _hasHydrated: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  /**
   * Login function with Zustand integration and automatic redirection
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      // Use security.login for the API call
      const data = await security.login(credentials);

      // Update store with user data (including pk_user for stateless API)
      setUser(data.user, data.roles, data.session_id, data.pk_user);

      // Redirect based on role
      if (data.roles.includes("ROLE_OCCUPANT")) {
        router.push("/occupant");
      } else if (data.roles.includes("ROLE_GESTIONNAIRE")) {
        router.push("/parc");
      } else {
        router.push("/parc");
      }

      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function with Zustand cleanup and automatic redirection
   */
  const logout = async () => {
    try {
      // Use security.logout for the API call
      await security.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear auth state in store
      clearAuth();

      // Clear all queries (security.logout already does this, but we ensure it)
      queryClient.clear();

      // Redirect to login
      router.push("/login");
    }
  };

  /**
   * Check if user is authenticated (local check only - stateless)
   * Verifies that sessionId, pkUser, and user are present in the store
   * No server call needed - validation happens automatically on API requests
   */
  const checkAndSyncSession = (): boolean => {
    // Stateless: check local store only
    // If sessionId/pkUser are invalid, API requests will return 401
    // and the interceptor will redirect to /login
    return isAuthenticated && !!sessionId && !!pkUser && !!user;
  };

  /**
   * Check if user is authenticated
   * Stateless: uses only local store (sessionId, pkUser, user)
   * No server check needed - validation happens on API requests
   */
  const isAuthenticatedState = isAuthenticated && !!sessionId && !!pkUser && !!user;

  /**
   * Combined loading state
   */
  const isLoading = storeLoading || security.isLoggingIn || security.isLoggingOut;

  /**
   * Combined error state
   */
  const error = storeError || security.loginError;

  return {
    // State
    user,
    roles,
    sessionId,
    pkUser,
    isAuthenticated: isAuthenticatedState,
    isLoading,
    hasHydrated: _hasHydrated,
    error: error ? handleApiError(error) : null,

    // Actions
    login,
    logout,
    checkAndSyncSession,

    // Role checks
    hasRole,
    hasAnyRole,

    // Mutation states
    isLoggingIn: security.isLoggingIn || storeLoading,
    isLoggingOut: security.isLoggingOut,
  };
}

