import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  Building,
  Housing,
  HousingDetailsResponse,
  InterventionDetails,
  Intervention,
  AnomalyListResponse,
  LeakListResponse,
  DysfunctionListResponse,
  FilterParams,
  FilterValues,
  TicketOwner,
  CreateTicketRequest,
  CreateTicketResponse,
  OccupantData,
  AppareilInfo,
  DashboardData,
} from "@/lib/types/api";

/**
 * Parameters for filtering logements
 */
export interface FilterLogementsParams extends FilterParams {
  pkImmeuble?: number | string;
  gestion?: boolean;
  search?: boolean;
}

/**
 * Response from /api/logements/immeuble/{pkImmeuble}
 */
export interface LogementsByImmeubleResponse {
  immeuble: Building;
}

/**
 * Response from /api/logements/{pkLogement}/ticket-owner
 */
export interface TicketOwnerResponse {
  Nom?: string;
  Email?: string;
  TelFixe?: string;
  TelMobile?: string;
  [key: string]: any;
}

/**
 * Response from /api/logements/search
 */
export interface LogementsSearchResponse {
  board: DashboardData;
}

/**
 * Response from /api/logements/{pkLogement}/appareils/{type}
 */
export interface InfosAppareilsResponse {
  pkLogement: string | number;
  type: "eau" | "chauffage";
  appareils: AppareilInfo[];
}

/**
 * Response from /api/logements/{pkLogement}/interventions/{pkIntervention}
 */
export interface LogementInterventionResponse {
  logement: Housing;
  depannage: InterventionDetails;
}

/**
 * Response from /api/logements/{pkLogement}/interventions
 */
export interface LogementInterventionsListResponse {
  logement: Housing;
  depannages: Intervention[];
  filters: FilterValues;
}

/**
 * Response from /api/logements/filter
 */
export interface FilterLogementsResponse {
  logements: Array<{
    infosLogement: Housing;
    comptesAppareils: any;
  }>;
  filters: FilterValues;
  gestion?: boolean;
  immeuble?: Building;
  board?: DashboardData;
}

/**
 * Response from update occupant
 */
export interface UpdateOccupantResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * Helper function to download a blob file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Custom hook for Logements (Housing Units) API endpoints
 *
 * Provides all logement-related API calls including:
 * - Logement list and filtering
 * - Logement details
 * - Ticket management
 * - Interventions, leaks, anomalies, dysfunctions
 * - Reports and exports
 * - Occupant management
 *
 * @example
 * ```tsx
 * const { getLogement, createTicket, getInterventions, exportAnomalies } = useLogements();
 *
 * // Get logement details
 * const logement = await getLogement("12345");
 *
 * // Create ticket
 * await createTicket("12345", {
 *   pkLogement: "12345",
 *   name: "John Doe",
 *   email: "john@example.com",
 *   message: "Issue description",
 * });
 *
 * // Export anomalies
 * await exportAnomalies("12345");
 * ```
 */
export function useLogements() {
  const queryClient = useQueryClient();

  /**
   * Get logements by immeuble query
   * GET /api/logements/immeuble/{pkImmeuble}
   * @param pkImmeuble - Building ID
   */
  const getLogementsByImmeubleQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["logements", "immeuble", pkImmeuble],
      queryFn: async (): Promise<LogementsByImmeubleResponse> => {
        const response = await api.get<LogementsByImmeubleResponse>(
          `/logements/immeuble/${pkImmeuble}`
        );
        return extractApiData<LogementsByImmeubleResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get logements by immeuble
   * @param pkImmeuble - Building ID
   * @returns Promise with immeuble data
   */
  const getLogementsByImmeuble = async (
    pkImmeuble: string | number
  ): Promise<LogementsByImmeubleResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", "immeuble", pkImmeuble],
      queryFn: async (): Promise<LogementsByImmeubleResponse> => {
        const response = await api.get<LogementsByImmeubleResponse>(
          `/logements/immeuble/${pkImmeuble}`
        );
        return extractApiData<LogementsByImmeubleResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Create ticket mutation
   * POST /api/logements/{pkLogement}/tickets
   * @param pkLogement - Logement ID
   * @param data - Ticket data
   * @param attachment - Optional file attachment
   */
  const createTicketMutation = useMutation({
    mutationFn: async ({
      pkLogement,
      data,
      attachment,
    }: {
      pkLogement: string | number;
      data: CreateTicketRequest;
      attachment?: File;
    }): Promise<CreateTicketResponse> => {
      const formData = new FormData();
      
      // Add form data
      formData.append("intervention[pkLogement]", String(pkLogement));
      formData.append("intervention[name]", data.name);
      formData.append("intervention[email]", data.email);
      formData.append("intervention[objet]", data.objet);
      formData.append("intervention[message]", data.message);
      
      if (data.phone) {
        formData.append("intervention[phone]", data.phone);
      }
      if (data.mobile) {
        formData.append("intervention[mobile]", data.mobile);
      }
      
      // Add attachment if provided
      if (attachment) {
        formData.append("intervention[attachment]", attachment);
      }

      const response = await api.post<CreateTicketResponse>(
        `/logements/${pkLogement}/tickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return extractApiData<CreateTicketResponse>(response);
    },
    onSuccess: () => {
      // Invalidate tickets queries
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  /**
   * Create ticket
   * @param pkLogement - Logement ID
   * @param data - Ticket data
   * @param attachment - Optional file attachment
   * @returns Promise with ticket creation response
   */
  const createTicket = async (
    pkLogement: string | number,
    data: CreateTicketRequest,
    attachment?: File
  ): Promise<CreateTicketResponse> => {
    return createTicketMutation.mutateAsync({ pkLogement, data, attachment });
  };

  /**
   * Get ticket owner query
   * GET/POST /api/logements/{pkLogement}/ticket-owner
   * @param pkLogement - Logement ID
   */
  const getTicketOwnerQuery = (pkLogement: string | number) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "ticket-owner"],
      queryFn: async (): Promise<TicketOwnerResponse> => {
        const response = await api.get<TicketOwnerResponse>(
          `/logements/${pkLogement}/ticket-owner`
        );
        return extractApiData<TicketOwnerResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get ticket owner
   * @param pkLogement - Logement ID
   * @returns Promise with ticket owner data
   */
  const getTicketOwner = async (
    pkLogement: string | number
  ): Promise<TicketOwnerResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "ticket-owner"],
      queryFn: async (): Promise<TicketOwnerResponse> => {
        const response = await api.get<TicketOwnerResponse>(
          `/logements/${pkLogement}/ticket-owner`
        );
        return extractApiData<TicketOwnerResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Search logements query
   * GET /api/logements/search
   */
  const searchLogementsQuery = useQuery({
    queryKey: ["logements", "search"],
    queryFn: async (): Promise<LogementsSearchResponse> => {
      const response = await api.get<LogementsSearchResponse>(
        "/logements/search"
      );
      return extractApiData<LogementsSearchResponse>(response);
    },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    enabled: false, // Disabled by default
  });

  /**
   * Search logements
   * @returns Promise with dashboard data
   */
  const searchLogements = async (): Promise<LogementsSearchResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", "search"],
      queryFn: async (): Promise<LogementsSearchResponse> => {
        const response = await api.get<LogementsSearchResponse>(
          "/logements/search"
        );
        return extractApiData<LogementsSearchResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get device information query
   * GET /api/logements/{pkLogement}/appareils/{type}
   * @param pkLogement - Logement ID
   * @param type - Device type ('eau' or 'chauffage')
   */
  const getInfosAppareilsQuery = (
    pkLogement: string | number,
    type: "eau" | "chauffage"
  ) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "appareils", type],
      queryFn: async (): Promise<InfosAppareilsResponse> => {
        const response = await api.get<InfosAppareilsResponse>(
          `/logements/${pkLogement}/appareils/${type}`
        );
        return extractApiData<InfosAppareilsResponse>(response);
      },
      enabled: !!pkLogement && !!type,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get device information
   * @param pkLogement - Logement ID
   * @param type - Device type ('eau' or 'chauffage')
   * @returns Promise with device information
   */
  const getInfosAppareils = async (
    pkLogement: string | number,
    type: "eau" | "chauffage"
  ): Promise<InfosAppareilsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "appareils", type],
      queryFn: async (): Promise<InfosAppareilsResponse> => {
        const response = await api.get<InfosAppareilsResponse>(
          `/logements/${pkLogement}/appareils/${type}`
        );
        return extractApiData<InfosAppareilsResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get logement details query
   * GET /api/logements/{pkLogement}
   * @param pkLogement - Logement ID
   */
  const getLogementQuery = (pkLogement: string | number) => {
    return useQuery({
      queryKey: ["logements", pkLogement],
      queryFn: async (): Promise<HousingDetailsResponse> => {
        const response = await api.get<HousingDetailsResponse>(
          `/logements/${pkLogement}`
        );
        return extractApiData<HousingDetailsResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get logement details
   * @param pkLogement - Logement ID
   * @returns Promise with logement details
   */
  const getLogement = async (
    pkLogement: string | number
  ): Promise<HousingDetailsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement],
      queryFn: async (): Promise<HousingDetailsResponse> => {
        const response = await api.get<HousingDetailsResponse>(
          `/logements/${pkLogement}`
        );
        return extractApiData<HousingDetailsResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Update occupant mutation
   * PUT/PATCH /api/logements/{pkLogement}/occupant
   * @param pkLogement - Logement ID
   * @param data - Occupant data
   */
  const updateOccupantMutation = useMutation({
    mutationFn: async ({
      pkLogement,
      data,
    }: {
      pkLogement: string | number;
      data: OccupantData;
    }): Promise<UpdateOccupantResponse> => {
      const response = await api.put<UpdateOccupantResponse>(
        `/logements/${pkLogement}/occupant`,
        data
      );
      return extractApiData<UpdateOccupantResponse>(response);
    },
    onSuccess: (_, variables) => {
      // Invalidate logement query to refresh data
      queryClient.invalidateQueries({
        queryKey: ["logements", variables.pkLogement],
      });
    },
  });

  /**
   * Update occupant
   * @param pkLogement - Logement ID
   * @param data - Occupant data
   * @returns Promise with update response
   */
  const updateOccupant = async (
    pkLogement: string | number,
    data: OccupantData
  ): Promise<UpdateOccupantResponse> => {
    return updateOccupantMutation.mutateAsync({ pkLogement, data });
  };

  /**
   * Get repartition report (PDF)
   * GET/POST /api/logements/{pkLogement}/releve-repart
   * Downloads the file automatically
   * @param pkLogement - Logement ID
   * @returns Promise that resolves when download is complete
   */
  const getRepartReleve = async (
    pkLogement: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(`/logements/${pkLogement}/releve-repart`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `relevé-${dateStr}.pdf`;

      downloadBlob(blob, filename);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download repartition report: ${errorMessage}`);
    }
  };

  /**
   * Get intervention details query
   * GET /api/logements/{pkLogement}/interventions/{pkIntervention}
   * @param pkLogement - Logement ID
   * @param pkIntervention - Intervention ID
   */
  const getInterventionQuery = (
    pkLogement: string | number,
    pkIntervention: string | number
  ) => {
    return useQuery({
      queryKey: [
        "logements",
        pkLogement,
        "interventions",
        pkIntervention,
      ],
      queryFn: async (): Promise<LogementInterventionResponse> => {
        const response = await api.get<LogementInterventionResponse>(
          `/logements/${pkLogement}/interventions/${pkIntervention}`
        );
        return extractApiData<LogementInterventionResponse>(response);
      },
      enabled: !!pkLogement && !!pkIntervention,
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get intervention details
   * @param pkLogement - Logement ID
   * @param pkIntervention - Intervention ID
   * @returns Promise with intervention details
   */
  const getIntervention = async (
    pkLogement: string | number,
    pkIntervention: string | number
  ): Promise<LogementInterventionResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: [
        "logements",
        pkLogement,
        "interventions",
        pkIntervention,
      ],
      queryFn: async (): Promise<LogementInterventionResponse> => {
        const response = await api.get<LogementInterventionResponse>(
          `/logements/${pkLogement}/interventions/${pkIntervention}`
        );
        return extractApiData<LogementInterventionResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get interventions list query
   * GET /api/logements/{pkLogement}/interventions
   * @param pkLogement - Logement ID
   */
  const getInterventionsQuery = (pkLogement: string | number) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "interventions"],
      queryFn: async (): Promise<LogementInterventionsListResponse> => {
        const response = await api.get<LogementInterventionsListResponse>(
          `/logements/${pkLogement}/interventions`
        );
        return extractApiData<LogementInterventionsListResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
  };

  /**
   * Get interventions list
   * @param pkLogement - Logement ID
   * @returns Promise with interventions list
   */
  const getInterventions = async (
    pkLogement: string | number
  ): Promise<LogementInterventionsListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "interventions"],
      queryFn: async (): Promise<LogementInterventionsListResponse> => {
        const response = await api.get<LogementInterventionsListResponse>(
          `/logements/${pkLogement}/interventions`
        );
        return extractApiData<LogementInterventionsListResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Filter logements mutation
   * GET/POST /api/logements/filter
   * @param params - Filter parameters
   */
  const filterLogementsMutation = useMutation({
    mutationFn: async (
      params: FilterLogementsParams
    ): Promise<FilterLogementsResponse> => {
      const response = await api.post<FilterLogementsResponse>(
        "/logements/filter",
        params
      );
      return extractApiData<FilterLogementsResponse>(response);
    },
  });

  /**
   * Filter logements
   * @param params - Filter parameters
   * @returns Promise with filtered logements
   */
  const filterLogements = async (
    params: FilterLogementsParams
  ): Promise<FilterLogementsResponse> => {
    return filterLogementsMutation.mutateAsync(params);
  };

  /**
   * Get leaks list query
   * GET /api/logements/{pkLogement}/fuites
   * @param pkLogement - Logement ID
   * @param appareil - Optional device ID
   */
  const getFuitesQuery = (
    pkLogement: string | number,
    appareil?: string
  ) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "fuites", appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<LeakListResponse>(
          `/logements/${pkLogement}/fuites`,
          { params }
        );
        return extractApiData<LeakListResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get leaks list
   * @param pkLogement - Logement ID
   * @param appareil - Optional device ID
   * @returns Promise with leaks list
   */
  const getFuites = async (
    pkLogement: string | number,
    appareil?: string
  ): Promise<LeakListResponse> => {
    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "fuites", appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/logements/${pkLogement}/fuites`,
          { params }
        );
        return extractApiData<LeakListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get dysfunctions list query
   * GET /api/logements/{pkLogement}/dysfonctionnements
   * @param pkLogement - Logement ID
   */
  const getDysfonctionnementsQuery = (pkLogement: string | number) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "dysfonctionnements"],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/logements/${pkLogement}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get dysfunctions list
   * @param pkLogement - Logement ID
   * @returns Promise with dysfunctions list
   */
  const getDysfonctionnements = async (
    pkLogement: string | number
  ): Promise<DysfunctionListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "dysfonctionnements"],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/logements/${pkLogement}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get anomalies list query
   * GET /api/logements/{pkLogement}/anomalies
   * @param pkLogement - Logement ID
   * @param appareil - Optional device ID
   */
  const getAnomaliesQuery = (
    pkLogement: string | number,
    appareil?: string
  ) => {
    return useQuery({
      queryKey: ["logements", pkLogement, "anomalies", appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<AnomalyListResponse>(
          `/logements/${pkLogement}/anomalies`,
          { params }
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      enabled: !!pkLogement,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get anomalies list
   * @param pkLogement - Logement ID
   * @param appareil - Optional device ID
   * @returns Promise with anomalies list
   */
  const getAnomalies = async (
    pkLogement: string | number,
    appareil?: string
  ): Promise<AnomalyListResponse> => {
    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["logements", pkLogement, "anomalies", appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/logements/${pkLogement}/anomalies`,
          { params }
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Export logements to Excel
   * GET /api/logements/immeuble/{pkImmeuble}/export
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const exportLogements = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/logements/immeuble/${pkImmeuble}/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-logements.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export logements: ${errorMessage}`);
    }
  };

  /**
   * Export anomalies to Excel
   * GET /api/logements/{pkLogement}/anomalies/export
   * Downloads the file automatically
   * @param pkLogement - Logement ID
   * @returns Promise that resolves when download is complete
   */
  const exportAnomalies = async (
    pkLogement: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/logements/${pkLogement}/anomalies/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-anomalies.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export anomalies: ${errorMessage}`);
    }
  };

  /**
   * Export leaks to Excel
   * GET /api/logements/{pkLogement}/fuites/export
   * Downloads the file automatically
   * @param pkLogement - Logement ID
   * @returns Promise that resolves when download is complete
   */
  const exportFuites = async (
    pkLogement: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/logements/${pkLogement}/fuites/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-fuites.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export leaks: ${errorMessage}`);
    }
  };

  /**
   * Export interventions to Excel
   * GET /api/logements/{pkLogement}/interventions/export
   * Downloads the file automatically
   * @param pkLogement - Logement ID
   * @returns Promise that resolves when download is complete
   */
  const exportInterventions = async (
    pkLogement: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/logements/${pkLogement}/interventions/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-interventions.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export interventions: ${errorMessage}`);
    }
  };

  /**
   * Export dysfunctions to Excel
   * GET /api/logements/{pkLogement}/dysfonctionnements/export
   * Downloads the file automatically
   * @param pkLogement - Logement ID
   * @returns Promise that resolves when download is complete
   */
  const exportDysfonctionnements = async (
    pkLogement: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/logements/${pkLogement}/dysfonctionnements/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-alarmestechniques.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export dysfunctions: ${errorMessage}`);
    }
  };

  /**
   * Download guide PDF
   * GET /api/logements/guide
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const getGuide = async (): Promise<void> => {
    try {
      const response = await api.get("/logements/guide", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      downloadBlob(blob, "GuideOccupant.pdf");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download guide: ${errorMessage}`);
    }
  };

  /**
   * Create ticket from immeuble mutation
   * POST /api/logements/immeuble/{pkImmeuble}/tickets
   * @param pkImmeuble - Building ID
   * @param data - Ticket data
   * @param attachment - Optional file attachment
   */
  const createTicketImmeubleMutation = useMutation({
    mutationFn: async ({
      pkImmeuble,
      data,
      attachment,
    }: {
      pkImmeuble: string | number;
      data: CreateTicketRequest;
      attachment?: File;
    }): Promise<CreateTicketResponse> => {
      const formData = new FormData();
      
      // Add form data
      formData.append("intervention[pkLogement]", String(data.pkLogement));
      formData.append("intervention[name]", data.name);
      formData.append("intervention[email]", data.email);
      formData.append("intervention[message]", data.message);
      
      if (data.phone) {
        formData.append("intervention[phone]", data.phone);
      }
      if (data.mobile) {
        formData.append("intervention[mobile]", data.mobile);
      }
      
      // Add attachment if provided
      if (attachment) {
        formData.append("intervention[attachment]", attachment);
      }

      const response = await api.post<CreateTicketResponse>(
        `/logements/immeuble/${pkImmeuble}/tickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return extractApiData<CreateTicketResponse>(response);
    },
    onSuccess: () => {
      // Invalidate tickets queries
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  /**
   * Create ticket from immeuble
   * @param pkImmeuble - Building ID
   * @param data - Ticket data
   * @param attachment - Optional file attachment
   * @returns Promise with ticket creation response
   */
  const createTicketFromImmeuble = async (
    pkImmeuble: string | number,
    data: CreateTicketRequest,
    attachment?: File
  ): Promise<CreateTicketResponse> => {
    return createTicketImmeubleMutation.mutateAsync({
      pkImmeuble,
      data,
      attachment,
    });
  };

  return {
    // Query functions (async functions that refetch)
    getLogementsByImmeuble,
    getTicketOwner,
    searchLogements,
    getInfosAppareils,
    getLogement,
    getIntervention,
    getInterventions,
    getFuites,
    getAnomalies,
    getDysfonctionnements,

    // Mutation functions
    createTicket,
    updateOccupant,
    filterLogements,
    createTicketFromImmeuble,

    // Export/Download functions
    getRepartReleve,
    exportLogements,
    exportAnomalies,
    exportFuites,
    exportInterventions,
    exportDysfonctionnements,
    getGuide,

    // Mutation states
    isCreatingTicket: createTicketMutation.isPending,
    isUpdatingOccupant: updateOccupantMutation.isPending,
    isFiltering: filterLogementsMutation.isPending,
    isCreatingTicketImmeuble: createTicketImmeubleMutation.isPending,

    // Mutation errors
    createTicketError: createTicketMutation.error
      ? handleApiError(createTicketMutation.error)
      : null,
    updateOccupantError: updateOccupantMutation.error
      ? handleApiError(updateOccupantMutation.error)
      : null,
    filterError: filterLogementsMutation.error
      ? handleApiError(filterLogementsMutation.error)
      : null,
    createTicketImmeubleError: createTicketImmeubleMutation.error
      ? handleApiError(createTicketImmeubleMutation.error)
      : null,

    // Query states (from reactive queries)
    searchLogementsData: searchLogementsQuery.data,
    searchLogementsIsLoading: searchLogementsQuery.isLoading,
    searchLogementsError: searchLogementsQuery.error
      ? handleApiError(searchLogementsQuery.error)
      : null,

    // Query hooks for reactive usage (with parameters)
    getLogementsByImmeubleQuery,
    getTicketOwnerQuery,
    getInfosAppareilsQuery,
    getLogementQuery,
    getInterventionQuery,
    getInterventionsQuery,
    getFuitesQuery,
    getAnomaliesQuery,
    getDysfonctionnementsQuery,

    // Direct access to mutations/queries for advanced usage
    createTicketMutation,
    updateOccupantMutation,
    filterLogementsMutation,
    createTicketImmeubleMutation,
    searchLogementsQuery,
  };
}

