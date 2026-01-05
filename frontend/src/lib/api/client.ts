import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * API Error structure
 */
export interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: string[];
}

/**
 * Create and configure Axios instance for API calls
 */
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://techl5599:8000/api';

  const client = axios.create({
    baseURL,
    withCredentials: true, // Important: Include cookies (PHPSESSID) in requests
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });

  // Request interceptor - Add authentication headers for stateless API
  client.interceptors.request.use(
    (config) => {
      // Add sessionId and pkUser from localStorage (via Zustand store)
      // These are set after login and persist across page refreshes
      if (typeof window !== 'undefined') {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const authData = JSON.parse(authStorage);
            const state = authData?.state;
            
            if (state?.sessionId && state?.pkUser) {
              config.headers['X-Session-ID'] = state.sessionId;
              config.headers['X-Pk-User'] = String(state.pkUser);
            }
          }
        } catch (error) {
          // Silently fail if localStorage is not available or data is invalid
          console.warn('Failed to read auth data from localStorage:', error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // Return the data directly if the response structure is correct
      return response;
    },
    (error: AxiosError<ApiError>) => {
      // Handle errors
      if (error.response) {
        const { status, data } = error.response;

        // TEMPORARILY DISABLED: Handle 401 Unauthorized - Session expired or invalid
        // TODO: Re-enable after fixing the redirect loop issue
        /*
        if (status === 401) {
          // Redirect to login page (only on client side)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        */

        // Handle 403 Forbidden - Access denied
        if (status === 403) {
          // You can show an error message or redirect
          console.error('Access forbidden');
        }

        // Handle 404 Not Found
        if (status === 404) {
          console.error('Resource not found');
        }

        // Handle 500 Server Error
        if (status >= 500) {
          console.error('Server error:', data?.message || 'Internal server error');
        }

        // Return the error response with API error structure
        return Promise.reject({
          ...error,
          apiError: data,
        });
      }

      // Network error or other issues
      if (error.request) {
        console.error('Network error:', error.message);
        return Promise.reject({
          ...error,
          apiError: {
            success: false,
            status: 0,
            message: 'Network error. Please check your connection.',
          },
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Export the configured client instance
export const apiClient = createApiClient();

/**
 * Helper function to extract data from API response
 */
export const extractApiData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Invalid API response');
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (error?.apiError?.message) {
    return error.apiError.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * API methods for common operations
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.patch<ApiResponse<T>>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },
};

export default apiClient;

