import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Request data for submitting a water meter reading
 */
export interface ReleveOccupantRequest {
  // Informations Immeuble
  numeroImmeuble: string;
  batiment?: string;
  escalier?: string;
  etage?: string;
  datePassage: string;

  // Informations Occupant
  prenom: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;

  // Compteurs Eau Froide
  cuisine_ef_num?: string;
  cuisine_ef?: number;
  salleDeBains_ef_num?: string;
  salleDeBains_ef?: number;
  wc_ef_num?: string;
  wc_ef?: number;
  autreEmplacement_ef_loc?: string;
  autreEmplacement_ef_num?: string;
  autreEmplacement_ef?: number;

  // Compteurs Eau Chaude
  cuisine_ec_num?: string;
  cuisine_ec?: number;
  salleDeBains_ec_num?: string;
  salleDeBains_ec?: number;
  wc_ec_num?: string;
  wc_ec?: number;
  autreEmplacement_ec_loc?: string;
  autreEmplacement_ec_num?: string;
  autreEmplacement_ec?: number;
}

/**
 * Response from submitting a water meter reading
 */
export interface ReleveOccupantResponse {
  success: boolean;
  message?: string;
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
  const useOccupantLogementQuery = useQuery({
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
  const useSimulatorQuery = useQuery({
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
  const useInterventionQuery = (pkIntervention: string | number) => {
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
  const useInterventionsQuery = useQuery({
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
  const useFuitesQuery = (appareil?: string) => {
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
  const useDysfonctionnementsQuery = useQuery({
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
  const useAnomaliesQuery = (appareil?: string) => {
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

  /**
   * Submit water meter reading mutation
   * POST /api/occupant/releve
   * @param data - Water meter reading data
   * @returns Promise with success/error response
   */
  const setReleveOccupantMutation = useMutation({
    mutationFn: async (
      data: ReleveOccupantRequest
    ): Promise<ReleveOccupantResponse> => {

      const jsonData = {
        // Informations Immeuble
        "immeuble": data.numeroImmeuble,
        "date_passage": data.datePassage,
        // Informations Occupant
        "prenom": data.prenom,
        "nom": data.nom,
        "adresse": data.adresse,
        "code_postal": data.codePostal,
        "ville": data.ville,
        "telephone": data.telephone,
        "email": data.email,
        // Champs optionnels
        "batiment": data.batiment ?? "",
        "escalier": data.escalier ?? "",
        "etage": data.etage ?? "",
        // Compteurs Eau Froide
        "ef_cuisine_num": data.cuisine_ef_num ?? "",
        "ef_cuisine": String(data.cuisine_ef ?? ""),
        "ef_salle_de_bains_num": data.salleDeBains_ef_num ?? "",
        "ef_salle_de_bains": String(data.salleDeBains_ef ?? ""),
        "ef_wc_num": data.wc_ef_num ?? "",
        "ef_wc": String(data.wc_ef ?? ""),
        "ef_nomautre": data.autreEmplacement_ef_loc ?? "",
        "ef_autre_num": data.autreEmplacement_ef_num ?? "",
        "ef_autre": String(data.autreEmplacement_ef ?? ""),
        // Compteurs Eau Chaude
        "ec_cuisine_num": data.cuisine_ec_num ?? "",
        "ec_cuisine": String(data.cuisine_ec ?? ""),
        "ec_salle_de_bains_num": data.salleDeBains_ec_num ?? "",
        "ec_salle_de_bains": String(data.salleDeBains_ec ?? ""),
        "ec_wc_num": data.wc_ec_num ?? "",
        "ec_wc": String(data.wc_ec ?? ""),
        "ec_nomautre": data.autreEmplacement_ec_loc ?? "",
        "ec_autre_num": data.autreEmplacement_ec_num ?? "",
      };

      const response = await api.post<ReleveOccupantResponse>(
        "/occupant/releve",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return extractApiData<ReleveOccupantResponse>(response);
    },
  });

  /**
   * Submit water meter reading
   * @param data - Water meter reading data
   * @returns Promise with success/error response
   */
  const setReleveOccupant = async (
    data: ReleveOccupantRequest
  ): Promise<ReleveOccupantResponse> => {
    return setReleveOccupantMutation.mutateAsync(data);
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
    setReleveOccupant,

    occupantLogementData: useOccupantLogementQuery.data,
    occupantLogementIsLoading: useOccupantLogementQuery.isLoading,
    occupantLogementError: useOccupantLogementQuery.error
      ? handleApiError(useOccupantLogementQuery.error)
      : null,

    simulatorData: useSimulatorQuery.data,
    simulatorIsLoading: useSimulatorQuery.isLoading,
    simulatorError: useSimulatorQuery.error
      ? handleApiError(useSimulatorQuery.error)
      : null,

    interventionsData: useInterventionsQuery.data,
    interventionsIsLoading: useInterventionsQuery.isLoading,
    interventionsError: useInterventionsQuery.error
      ? handleApiError(useInterventionsQuery.error)
      : null,

    dysfonctionnementsData: useDysfonctionnementsQuery.data,
    dysfonctionnementsIsLoading: useDysfonctionnementsQuery.isLoading,
    dysfonctionnementsError: useDysfonctionnementsQuery.error
      ? handleApiError(useDysfonctionnementsQuery.error)
      : null,

    isSubmittingReleve: setReleveOccupantMutation.isPending,
    releveError: setReleveOccupantMutation.error
      ? handleApiError(setReleveOccupantMutation.error)
      : null,

    useInterventionQuery,
    useFuitesQuery,
    useAnomaliesQuery,
    useOccupantLogementQuery,
    useSimulatorQuery,
    useInterventionsQuery,
    useDysfonctionnementsQuery,
  };
}

