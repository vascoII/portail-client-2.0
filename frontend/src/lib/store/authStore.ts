import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/lib/types/api";

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  roles: UserRole[];
  sessionId: string | null;
  pkUser: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // Internal flag to track hydration state
}

/**
 * Authentication actions interface
 */
interface AuthActions {
  setUser: (user: User | null, roles: UserRole[], sessionId: string | null, pkUser: number | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  roles: [],
  sessionId: null,
  pkUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

/**
 * Authentication store using Zustand with persistence
 * 
 * The store persists to localStorage to maintain authentication state
 * across page refreshes. However, the actual session is maintained
 * by the PHPSESSID cookie from the Symfony backend.
 * 
 * Note: The persist middleware is safe to use in Next.js as it only
 * accesses localStorage on the client side.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Set user authentication data
       */
      setUser: (user, roles, sessionId, pkUser) => {
        set({
          user,
          roles,
          sessionId,
          pkUser,
          isAuthenticated: !!user,
          error: null,
          _hasHydrated: true, // Ensure hydrated flag is set
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set error message
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear authentication data (logout)
       */
      clearAuth: () => {
        set({
          ...initialState,
        });
      },

      /**
       * Check if user has a specific role
       */
      hasRole: (role) => {
        const { roles } = get();
        return roles.includes(role);
      },

      /**
       * Check if user has any of the specified roles
       */
      hasAnyRole: (rolesToCheck) => {
        const { roles } = get();
        return rolesToCheck.some((role) => roles.includes(role));
      },
    }),
    {
      name: "auth-storage", // localStorage key
      // Only persist user data, not loading/error states
      // Don't persist _hasHydrated as it's an internal flag
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        sessionId: state.sessionId,
        pkUser: state.pkUser,
        isAuthenticated: state.isAuthenticated,
      }),
      // Skip hydration errors in Next.js SSR
      skipHydration: false,
      // Callback when hydration is complete
      onRehydrateStorage: () => {
        return (state, error) => {
          // After rehydration, we need to set the hydrated flag
          // We'll do this by calling set from the store instance
          // But since we can't access set here, we'll use a different approach:
          // The flag will be set via a useEffect in components that need it
          // For now, we'll ensure the state is properly set
          if (state) {
            // State is rehydrated, components will check this
            return { ...state, _hasHydrated: true };
          }
          return state;
        };
      },
    }
  )
);

