import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import type {
  Ticket,
  TicketListResponse,
  TicketOwner,
  DashboardData,
} from "@/lib/types/api";

/**
 * Response from /api/tickets endpoint
 */
export interface TicketsListResponse {
  board: DashboardData;
  tickets: Ticket[];
  count: number;
  showAll: boolean;
}

/**
 * Response from /api/tickets/menu endpoint
 */
export interface TicketsMenuResponse {
  isTicketInterEnabled: boolean;
  nbTicketsInterUser: number;
}

/**
 * Response from /api/tickets/{pkTicket}/attachment endpoint
 */
export interface TicketAttachmentResponse {
  attachmentName: string | null;
  attachmentContent: string | null; // Base64 encoded
}

/**
 * Response from /api/tickets/create/{pkLogement} endpoint
 */
export interface TicketCreateInfoResponse {
  ticketOwner: TicketOwner;
  formData: {
    pkLogement: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
  };
}

/**
 * Parameters for getting tickets list
 */
export interface GetTicketsParams {
  // When true => backend receives showall=O (tous les tickets)
  // When false => backend receives showall=N (tickets actifs uniquement)
  showAll?: boolean;
}

/**
 * Custom hook for Tickets API endpoints
 *
 * Provides all ticket-related API calls including:
 * - Listing tickets
 * - Getting ticket menu/statistics
 * - Closing tickets
 * - Getting ticket attachments
 * - Getting ticket creation info
 *
 * @example
 * ```tsx
 * const { getTickets, closeTicket, getAttachment } = useTickets();
 *
 * // Get tickets list
 * const tickets = await getTickets({ showAll: false });
 *
 * // Close a ticket
 * await closeTicket("5003X00002CuohYQAR");
 *
 * // Get attachment
 * const attachment = await getAttachment("5003X00002CuohYQAR");
 * ```
 */
export function useTickets() {
  const queryClient = useQueryClient();

  /**
   * Get tickets list query
   * GET /api/tickets
   * @param params - Query parameters (showAll)
   */
  const getTicketsQuery = (params?: GetTicketsParams) => {
    return useQuery({
      queryKey: ["tickets", params?.showAll],
      queryFn: async (): Promise<TicketsListResponse> => {
        const queryParams: any = {};
        if (params?.showAll !== undefined) {
          // Map boolean to backend expected values:
          // true  => showall=O (tous)
          // false => showall=N (actifs)
          queryParams.showall = params.showAll ? "O" : "N";
        }

        const response = await api.get<TicketsListResponse>("/tickets", {
          params: queryParams,
        });
        return extractApiData<TicketsListResponse>(response);
      },
      retry: false,
      staleTime: 1 * 60 * 1000, // Consider fresh for 1 minute (tickets change frequently)
    });
  };

  /**
   * Get tickets list
   * @param params - Query parameters (showAll)
   * @returns Promise with tickets list
   */
  const getTickets = async (
    params?: GetTicketsParams
  ): Promise<TicketsListResponse> => {
    const queryParams: any = {};
    if (params?.showAll !== undefined) {
      // Same mapping as in getTicketsQuery
      queryParams.showall = params.showAll ? "O" : "N";
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["tickets", params?.showAll],
      queryFn: async (): Promise<TicketsListResponse> => {
        const response = await api.get<TicketsListResponse>("/tickets", {
          params: queryParams,
        });
        return extractApiData<TicketsListResponse>(response);
      },
      retry: false,
      staleTime: 1 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get ticket menu/statistics
   * @returns Promise with menu information
   */
  const getTicketsMenu = async (): Promise<TicketsMenuResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["tickets", "menu"],
      queryFn: async (): Promise<TicketsMenuResponse> => {
        const response = await api.get<TicketsMenuResponse>("/tickets/menu");
        return extractApiData<TicketsMenuResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Close ticket mutation
   * POST/PUT /api/tickets/{pkTicket}/close
   * @param pkTicket - Ticket ID (CaseId)
   */
  const closeTicketMutation = useMutation({
    mutationFn: async (
      pkTicket: string
    ): Promise<{ success: boolean; message?: string }> => {
      const response = await api.post(`/tickets/${pkTicket}/close`);
      return extractApiData(response);
    },
    onSuccess: () => {
      // Invalidate tickets list and menu to refresh data
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  /**
   * Close ticket
   * @param pkTicket - Ticket ID (CaseId)
   * @returns Promise with close result
   */
  const closeTicket = async (
    pkTicket: string
  ): Promise<{ success: boolean; message?: string }> => {
    return closeTicketMutation.mutateAsync(pkTicket);
  };

  /**
   * Get ticket attachment query
   * GET /api/tickets/{pkTicket}/attachment
   * @param pkTicket - Ticket ID (CaseId)
   */
  const getTicketAttachmentQuery = (pkTicket: string) => {
    return useQuery({
      queryKey: ["tickets", pkTicket, "attachment"],
      queryFn: async (): Promise<TicketAttachmentResponse> => {
        const response = await api.get<TicketAttachmentResponse>(
          `/tickets/${pkTicket}/attachment`
        );
        return extractApiData<TicketAttachmentResponse>(response);
      },
      enabled: !!pkTicket,
      retry: false,
      staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes (attachments don't change)
    });
  };

  /**
   * Get ticket attachment
   * @param pkTicket - Ticket ID (CaseId)
   * @returns Promise with attachment data
   */
  const getTicketAttachment = async (
    pkTicket: string
  ): Promise<TicketAttachmentResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["tickets", pkTicket, "attachment"],
      queryFn: async (): Promise<TicketAttachmentResponse> => {
        const response = await api.get<TicketAttachmentResponse>(
          `/tickets/${pkTicket}/attachment`
        );
        return extractApiData<TicketAttachmentResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Helper function to download ticket attachment
   * @param pkTicket - Ticket ID (CaseId)
   * @returns Promise that resolves when download is complete
   */
  const downloadTicketAttachment = async (
    pkTicket: string
  ): Promise<void> => {
    try {
      const attachment = await getTicketAttachment(pkTicket);

      if (!attachment.attachmentContent || !attachment.attachmentName) {
        throw new Error("Attachment not found or empty");
      }

      // Decode base64 content
      const binaryString = window.atob(attachment.attachmentContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.attachmentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Get ticket creation info query
   * GET /api/tickets/create/{pkLogement}
   * @param pkLogement - Logement ID
   */
  const getTicketCreateInfoQuery = (pkLogement: string | number) => {
    return useQuery({
      queryKey: ["tickets", "create", pkLogement],
      queryFn: async (): Promise<TicketCreateInfoResponse> => {
        const response = await api.get<TicketCreateInfoResponse>(
          `/tickets/create/${pkLogement}`
        );
        return extractApiData<TicketCreateInfoResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    });
  };

  /**
   * Get ticket creation info
   * @param pkLogement - Logement ID
   * @returns Promise with ticket creation info
   */
  const getTicketCreateInfo = async (
    pkLogement: string | number
  ): Promise<TicketCreateInfoResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["tickets", "create", pkLogement],
      queryFn: async (): Promise<TicketCreateInfoResponse> => {
        const response = await api.get<TicketCreateInfoResponse>(
          `/tickets/create/${pkLogement}`
        );
        return extractApiData<TicketCreateInfoResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  return {
    // Query functions (async functions that refetch)
    getTickets,
    getTicketsMenu,
    getTicketAttachment,
    getTicketCreateInfo,

    // Helper functions
    downloadTicketAttachment,

    // Mutation functions
    closeTicket,

    // Mutation states
    isClosing: closeTicketMutation.isPending,

    // Mutation errors
    closeError: closeTicketMutation.error
      ? handleApiError(closeTicketMutation.error)
      : null,

    // Query states (from reactive queries)
    ticketsData: getTicketsQuery().data,
    ticketsIsLoading: getTicketsQuery().isLoading,
    ticketsError: getTicketsQuery().error
      ? handleApiError(getTicketsQuery().error)
      : null,

    // Query hooks for reactive usage (with parameters)
    getTicketsQuery,
    getTicketAttachmentQuery,
    getTicketCreateInfoQuery,

    // Direct access to mutations for advanced usage
    closeTicketMutation,
  };
}

