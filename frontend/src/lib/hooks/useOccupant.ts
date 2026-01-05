import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  Housing,
  InterventionDetails,
  Intervention,
  AnomalyListResponse,
  LeakListResponse,
  DysfunctionListResponse,
  FilterValues,
  Subcontractor,
  User,
  ConsumptionTab,
} from "@/lib/types/api";

/**
 * Response from /api/occupant endpoint
 */
export interface OccupantLogementResponse {
  logement: Housing;
  consoTabs: ConsumptionTab;
  soustraitants: Subcontractor[];
}

/**
 * Response from /api/occupant/simulateur endpoint
 */
export interface OccupantSimulatorResponse {
  logement: Housing;
  consoTabs: ConsumptionTab;
}

/**
 * Response from /api/occupant/interventions/{pkIntervention}
 */
export interface OccupantInterventionResponse {
  logement: Housing;
  depannage: InterventionDetails;
}

/**
 * Response from /api/occupant/interventions
 */
export interface OccupantInterventionsListResponse {
  logement: Housing;
  depannages: Intervention[];
  filters: FilterValues;
}

export interface OccupantMyAccountResponse {
  logement: Housing;
  consoTabs: ConsumptionTab;
  rgpdcheckboxvalue: string; // 'true' or 'false'
}

export interface OccupantAlertesResponse {
  logement: Housing;
  consoTabs: ConsumptionTab;
  user: User;
}

export interface UpdateAlertesParams {
  SEUIL_CONSO_ACTIF?: boolean; // Will be converted to 'O' or 'N'
  [key: string]: any;
}

/**
 * Custom hook for Occupant API endpoints
 *
 * All endpoints are scoped by the current occupant FK (`fkUser`),
 * which is typically read from localStorage via `useFkUser()`.
 */
export function useOccupant(fkUser?: string | number | null) {
  const queryClient = useQueryClient();

  /**
   * Get current occupant's logement query
   * GET /api/occupant/{fk}
   */
  const getOccupantLogementQuery = useQuery({
    queryKey: ["occupant", "logement", fkUser],
    queryFn: async (): Promise<OccupantLogementResponse> => {
      const response = await api.get<OccupantLogementResponse>(
        `/occupant/${fkUser}`
      );
      return extractApiData<OccupantLogementResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    enabled: !!fkUser,
  });

  /**
   * Get current occupant's logement
   * @returns Promise with occupant logement data
   */
  const getOccupantLogement = async (): Promise<OccupantLogementResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch occupant logement");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "logement", fkUser],
      queryFn: async (): Promise<OccupantLogementResponse> => {
        const response = await api.get<OccupantLogementResponse>(
          `/occupant/${fkUser}`
        );
        return extractApiData<OccupantLogementResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get simulator data query
   * GET /api/occupant/{fk}/simulateur
   */
  const getSimulatorQuery = useQuery({
    queryKey: ["occupant", "simulateur", fkUser],
    queryFn: async (): Promise<OccupantSimulatorResponse> => {
      const response = await api.get<OccupantSimulatorResponse>(
        `/occupant/${fkUser}/simulateur`
      );
      return extractApiData<OccupantSimulatorResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    enabled: false, // Disabled by default (triggered via getSimulator)
  });

  /**
   * Get simulator data
   * @returns Promise with simulator data
   */
  const getSimulator = async (): Promise<OccupantSimulatorResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch simulator data");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "simulateur", fkUser],
      queryFn: async (): Promise<OccupantSimulatorResponse> => {
        const response = await api.get<OccupantSimulatorResponse>(
          `/occupant/${fkUser}/simulateur`
        );
        return extractApiData<OccupantSimulatorResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get intervention details query
   * GET /api/occupant/interventions/{pkIntervention}
   * @param pkIntervention - Intervention ID
   */
  const getInterventionQuery = (pkIntervention: string | number) => {
    return useQuery({
      queryKey: ["occupant", "interventions", pkIntervention],
      queryFn: async (): Promise<OccupantInterventionResponse> => {
        const response = await api.get<OccupantInterventionResponse>(
          `/occupant/interventions/${pkIntervention}`
        );
        return extractApiData<OccupantInterventionResponse>(response);
      },
      enabled: !!pkIntervention,
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get intervention details
   * @param pkIntervention - Intervention ID
   * @returns Promise with intervention details
   */
  const getIntervention = async (
    pkIntervention: string | number
  ): Promise<OccupantInterventionResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "interventions", pkIntervention],
      queryFn: async (): Promise<OccupantInterventionResponse> => {
        const response = await api.get<OccupantInterventionResponse>(
          `/occupant/interventions/${pkIntervention}`
        );
        return extractApiData<OccupantInterventionResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get interventions list query
   * GET /api/occupant/{fk}/interventions
   */
  const getInterventionsQuery = useQuery({
    queryKey: ["occupant", "interventions", fkUser],
    queryFn: async (): Promise<OccupantInterventionsListResponse> => {
      const response = await api.get<OccupantInterventionsListResponse>(
        `/occupant/${fkUser}/interventions`
      );
      return extractApiData<OccupantInterventionsListResponse>(response);
    },
    retry: false,
    staleTime: 2 * 60 * 1000,
    enabled: !!fkUser,
  });

  /**
   * Get interventions list
   * @returns Promise with interventions list
   */
  const getInterventions = async (): Promise<OccupantInterventionsListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch interventions");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "interventions", fkUser],
      queryFn: async (): Promise<OccupantInterventionsListResponse> => {
        const response = await api.get<OccupantInterventionsListResponse>(
          `/occupant/${fkUser}/interventions`
        );
        return extractApiData<OccupantInterventionsListResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get leaks list query
   * GET /api/occupant/{fk}/fuites
   * @param appareil - Optional device ID
   */
  const getFuitesQuery = (appareil?: string) => {
    return useQuery({
      queryKey: ["occupant", "fuites", fkUser, appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<LeakListResponse>(
          `/occupant/${fkUser}/fuites`,
          {
            params,
          }
        );
        return extractApiData<LeakListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      enabled: !!fkUser,
    });
  };

  /**
   * Get leaks list
   * @param appareil - Optional device ID
   * @returns Promise with leaks list
   */
  const getFuites = async (appareil?: string): Promise<LeakListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch leaks");
    }

    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "fuites", fkUser, appareil],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/occupant/${fkUser}/fuites`,
          {
            params,
          }
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
   * GET /api/occupant/{fk}/dysfonctionnements
   */
  const getDysfonctionnementsQuery = useQuery({
    queryKey: ["occupant", "dysfonctionnements", fkUser],
    queryFn: async (): Promise<DysfunctionListResponse> => {
      const response = await api.get<DysfunctionListResponse>(
        `/occupant/${fkUser}/dysfonctionnements`
      );
      return extractApiData<DysfunctionListResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    enabled: !!fkUser,
  });

  /**
   * Get dysfunctions list
   * @returns Promise with dysfunctions list
   */
  const getDysfonctionnements = async (): Promise<DysfunctionListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch dysfunctions");
    }

    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "dysfonctionnements", fkUser],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/occupant/${fkUser}/dysfonctionnements`
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
   * GET /api/occupant/{fk}/anomalies
   * @param appareil - Optional device ID
   */
  const getAnomaliesQuery = (appareil?: string) => {
    return useQuery({
      queryKey: ["occupant", "anomalies", fkUser, appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const params = appareil ? { appareil } : {};
        const response = await api.get<AnomalyListResponse>(
          `/occupant/${fkUser}/anomalies`,
          { params },
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      enabled: !!fkUser,
    });
  };

  /**
   * Get anomalies list
   * @param appareil - Optional device ID
   * @returns Promise with anomalies list
   */
  const getAnomalies = async (
    appareil?: string
  ): Promise<AnomalyListResponse> => {
    if (!fkUser) {
      throw new Error("fkUser is required to fetch anomalies");
    }

    const params = appareil ? { appareil } : {};
    const result = await queryClient.fetchQuery({
      queryKey: ["occupant", "anomalies", fkUser, appareil],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/occupant/${fkUser}/anomalies`,
          { params },
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Export anomalies to CSV
   * GET /api/occupant/{fk}/anomalies/export
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const exportAnomalies = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export anomalies");
      }

      const response = await api.get("/occupant/anomalies/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-anomalies.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export anomalies: ${errorMessage}`);
    }
  };

  /**
   * Export leaks to CSV
   * GET /api/occupant/{fk}/fuites/export
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const exportFuites = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export leaks");
      }

      const response = await api.get("/occupant/fuites/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-fuites.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export leaks: ${errorMessage}`);
    }
  };

  /**
   * Export interventions to CSV
   * GET /api/occupant/{fk}/interventions/export
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const exportInterventions = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export interventions");
      }

      const response = await api.get("/occupant/interventions/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-depannages.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export interventions: ${errorMessage}`);
    }
  };

  /**
   * Export dysfunctions to CSV
   * GET /api/occupant/{fk}/dysfonctionnements/export
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const exportDysfonctionnements = async (): Promise<void> => {
    try {
      if (!fkUser) {
        throw new Error("fkUser is required to export dysfunctions");
      }

      const response = await api.get("/occupant/dysfonctionnements/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "export-autres-dysfonctionnemnts.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export dysfunctions: ${errorMessage}`);
    }
  };

  /**
   * Get water report (PDF)
   * GET /api/occupant/{pkOccupant}/releve-eau
   * Downloads the file automatically
   * @param pkOccupant - Occupant ID
   * @returns Promise that resolves when download is complete
   */
  const getEauReleve = async (
    pkOccupant: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/occupant/${pkOccupant}/releve-eau`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `relevé-${dateStr}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download water report: ${errorMessage}`);
    }
  };

  /**
   * Get repartition report (PDF)
   * GET /api/occupant/{pkOccupant}/releve-repart/{pkImmeuble}
   * Downloads the file automatically
   * @param pkOccupant - Occupant ID
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const getRepartReleve = async (
    pkOccupant: string | number,
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/occupant/${pkOccupant}/releve-repart/${pkImmeuble}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `relevé-${dateStr}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(
        `Failed to download repartition report: ${errorMessage}`
      );
    }
  };

  /**
   * Get note report (PDF)
   * GET /api/occupant/{pkOccupant}/releve-note/{pkImmeuble}/{energie}
   * Downloads the file automatically
   * @param pkOccupant - Occupant ID
   * @param pkImmeuble - Building ID
   * @param energie - Energy type ('CHAUFFAGE' or 'EAU')
   * @returns Promise that resolves when download is complete
   */
  const getNoteReleve = async (
    pkOccupant: string | number,
    pkImmeuble: string | number,
    energie: "CHAUFFAGE" | "EAU"
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/occupant/${pkOccupant}/releve-note/${pkImmeuble}/${energie}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });

      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `relevé-${dateStr}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download note report: ${errorMessage}`);
    }
  };

  return {
    getOccupantLogement,
    getSimulator,
    getIntervention,
    getInterventions,
    getFuites,
    getAnomalies,
    getDysfonctionnements,

    exportAnomalies,
    exportFuites,
    exportInterventions,
    exportDysfonctionnements,
    getEauReleve,
    getRepartReleve,
    getNoteReleve,

    occupantLogementData: getOccupantLogementQuery.data,
    occupantLogementIsLoading: getOccupantLogementQuery.isLoading,
    occupantLogementError: getOccupantLogementQuery.error
      ? handleApiError(getOccupantLogementQuery.error)
      : null,

    simulatorData: getSimulatorQuery.data,
    simulatorIsLoading: getSimulatorQuery.isLoading,
    simulatorError: getSimulatorQuery.error
      ? handleApiError(getSimulatorQuery.error)
      : null,

    interventionsData: getInterventionsQuery.data,
    interventionsIsLoading: getInterventionsQuery.isLoading,
    interventionsError: getInterventionsQuery.error
      ? handleApiError(getInterventionsQuery.error)
      : null,

    dysfonctionnementsData: getDysfonctionnementsQuery.data,
    dysfonctionnementsIsLoading: getDysfonctionnementsQuery.isLoading,
    dysfonctionnementsError: getDysfonctionnementsQuery.error
      ? handleApiError(getDysfonctionnementsQuery.error)
      : null,

    getInterventionQuery,
    getFuitesQuery,
    getAnomaliesQuery,
    getOccupantLogementQuery,
    getSimulatorQuery,
    getInterventionsQuery,
    getDysfonctionnementsQuery,
  };
}

