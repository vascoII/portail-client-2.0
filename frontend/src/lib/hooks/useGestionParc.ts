import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  Building,
  BuildingListResponse,
  InterventionDetails,
  AnomalyListResponse,
  LeakListResponse,
  DysfunctionListResponse,
  FilterParams,
  ApiResponse,
  DashboardData,
  ChantierData,
} from "@/lib/types/api";

/**
 * Parameters for filtering buildings in gestion parc
 */
export interface FilterGestionParcParams extends FilterParams {
  ref?: string;
  ref_numero?: string;
  nom?: string;
  tout?: string;
  adresse?: string;
  search?: boolean;
}

/**
 * Response structure for gestion parc index (dashboard)
 */
export interface GestionParcIndexResponse {
  board: DashboardData;
  filters: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Response structure for gestion parc building details
 */
export interface GestionParcBuildingDetailsResponse {
  immeuble: Building;
  evolution_charts?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  comparative_chart?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  tabs_top_consos?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  tabs_evo_consos?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  chantier?: ChantierData;
}

/**
 * Helper function to download a blob file
 */
function downloadBlob(blob: Blob, filename: string, contentType: string): void {
  const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Custom hook for Gestion Parc (Property Management) API endpoints.
 *
 * Provides all gestion parc-related API calls including:
 * - Dashboard and building list
 * - Filtering buildings
 * - Retrieving building details, interventions, leaks, anomalies, dysfunctions
 * - Downloading various reports (PDF/Excel)
 *
 * Note: This hook is similar to useImmeubles but uses the /api/gestion-parc prefix
 * and is specifically for the "gestion parc" (property management) context.
 */
export function useGestionParc() {
  const queryClient = useQueryClient();

  // --- Queries ---

  /**
   * Fetches the gestion parc dashboard (building list).
   * GET /api/gestion-parc
   */
  const getGestionParcIndexQuery = useQuery<GestionParcIndexResponse, Error>({
    queryKey: ["gestion-parc", "index"],
    queryFn: async () => {
      const response = await api.get<GestionParcIndexResponse>(
        "/gestion-parc"
      );
      return extractApiData<GestionParcIndexResponse>(response);
    },
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    retry: false,
  });

  /**
   * Fetches details for a specific building in gestion parc.
   * GET /api/gestion-parc/{pkImmeuble}
   */
  const useGestionParcBuildingQuery = (pkImmeuble: string | number) =>
    useQuery<GestionParcBuildingDetailsResponse, Error>({
      queryKey: ["gestion-parc", pkImmeuble],
      queryFn: async () => {
        const response = await api.get<GestionParcBuildingDetailsResponse>(
          `/gestion-parc/${pkImmeuble}`
        );
        return extractApiData<GestionParcBuildingDetailsResponse>(response);
      },
      enabled: !!pkImmeuble,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      retry: false,
    });

  /**
   * Fetches details for a specific intervention within a building.
   * GET /api/gestion-parc/{pkImmeuble}/interventions/{pkIntervention}
   */
  const useGestionParcInterventionQuery = (
    pkImmeuble: string | number,
    pkIntervention: string | number
  ) =>
    useQuery<InterventionDetails, Error>({
      queryKey: ["gestion-parc", pkImmeuble, "interventions", pkIntervention],
      queryFn: async () => {
        const response = await api.get<{
          immeuble: Building;
          depannage: InterventionDetails;
        }>(
          `/gestion-parc/${pkImmeuble}/interventions/${pkIntervention}`
        );
        const data = extractApiData<{
          immeuble: Building;
          depannage: InterventionDetails;
        }>(response);
        return data.depannage;
      },
      enabled: !!pkImmeuble && !!pkIntervention,
      staleTime: 5 * 60 * 1000, // Interventions: updates are asynchronous, keep short cache
      retry: false,
    });

  /**
   * Fetches the list of interventions for a specific building.
   * GET /api/gestion-parc/{pkImmeuble}/interventions
   */
  const useGestionParcInterventionsQuery = (pkImmeuble: string | number) =>
    useQuery<
      ApiResponse<{ immeuble: Building; depannages: InterventionDetails[]; filters: any }>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Error
    >({
      queryKey: ["gestion-parc", pkImmeuble, "interventions"],
      queryFn: async () => {
        const response = await api.get<
          ApiResponse<{ immeuble: Building; depannages: InterventionDetails[]; filters: any }> // eslint-disable-line @typescript-eslint/no-explicit-any
        >(`/gestion-parc/${pkImmeuble}/interventions`);
        return extractApiData<
          ApiResponse<{ immeuble: Building; depannages: InterventionDetails[]; filters: any }> // eslint-disable-line @typescript-eslint/no-explicit-any
        >(response);
      },
      enabled: !!pkImmeuble,
      staleTime: 5 * 60 * 1000, // Interventions: updates are asynchronous, keep short cache
      retry: false,
    });

  /**
   * Fetches the list of leaks for a specific building.
   * GET /api/gestion-parc/{pkImmeuble}/fuites
   */
  const useGestionParcFuitesQuery = (pkImmeuble: string | number) =>
    useQuery<LeakListResponse, Error>({
      queryKey: ["gestion-parc", pkImmeuble, "fuites"],
      queryFn: async () => {
        const response = await api.get<LeakListResponse>(
          `/gestion-parc/${pkImmeuble}/fuites`
        );
        return extractApiData<LeakListResponse>(response);
      },
      enabled: !!pkImmeuble,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      retry: false,
    });

  /**
   * Fetches the list of anomalies for a specific building.
   * GET /api/gestion-parc/{pkImmeuble}/anomalies
   */
  const useGestionParcAnomaliesQuery = (pkImmeuble: string | number) =>
    useQuery<AnomalyListResponse, Error>({
      queryKey: ["gestion-parc", pkImmeuble, "anomalies"],
      queryFn: async () => {
        const response = await api.get<AnomalyListResponse>(
          `/gestion-parc/${pkImmeuble}/anomalies`
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      enabled: !!pkImmeuble,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      retry: false,
    });

  /**
   * Fetches the list of dysfunctions for a specific building.
   * GET /api/gestion-parc/{pkImmeuble}/dysfonctionnements
   */
  const useGestionParcDysfunctionsQuery = (pkImmeuble: string | number) =>
    useQuery<DysfunctionListResponse, Error>({
      queryKey: ["gestion-parc", pkImmeuble, "dysfonctionnements"],
      queryFn: async () => {
        const response = await api.get<DysfunctionListResponse>(
          `/gestion-parc/${pkImmeuble}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      enabled: !!pkImmeuble,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
      retry: false,
    });

  // --- Mutations ---

  /**
   * Filters buildings in gestion parc based on provided parameters.
   * GET/POST /api/gestion-parc/filtre
   */
  const filterGestionParcMutation = useMutation<
    BuildingListResponse,
    Error,
    FilterGestionParcParams
  >({
    mutationFn: async (params) => {
      const response = await api.get<BuildingListResponse>(
        "/gestion-parc/filtre",
        { params }
      );
      return extractApiData<BuildingListResponse>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestion-parc"] });
    },
  });

  // --- Helper Functions for Downloads ---

  /**
   * Downloads a report for a specific building.
   * GET/POST /api/gestion-parc/{pkImmeuble}/releve/{type}/{energie}
   */
  const getGestionParcReport = async (
    pkImmeuble: string | number,
    params: { type: string; energie: string; date?: string }
  ): Promise<void> => {
    try {
      const { type, energie, date } = params;
      const docType = type === "repartition" ? null : type; // API expects null for 'repartition'

      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/releve/${docType}/${energie}`,
        {
          params: { date },
          responseType: "blob", // Important for downloading files
        }
      );

      const contentType =
        response.headers["content-type"] || "application/pdf";
      const filename =
        response.headers["content-disposition"]?.split("filename=")[1]?.replace(/['"]/g, "") ||
        `relevé-${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.pdf`;

      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(response.data as unknown as Blob, filename, contentType);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Exports anomalies for a specific building to Excel.
   * GET /api/gestion-parc/{pkImmeuble}/anomalies/export
   */
  const exportGestionParcAnomalies = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/anomalies/export`,
        {
          responseType: "blob",
        }
      );
      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(
        response.data as unknown as Blob,
        `export-anomalies-${pkImmeuble}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Exports leaks for a specific building to Excel.
   * GET /api/gestion-parc/{pkImmeuble}/fuites/export
   */
  const exportGestionParcFuites = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/fuites/export`,
        {
          responseType: "blob",
        }
      );
      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(
        response.data as unknown as Blob,
        `export-fuites-${pkImmeuble}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Exports interventions for a specific building to Excel.
   * GET /api/gestion-parc/{pkImmeuble}/interventions/export
   */
  const exportGestionParcInterventions = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/interventions/export`,
        {
          responseType: "blob",
        }
      );
      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(
        response.data as unknown as Blob,
        `export-interventions-${pkImmeuble}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Exports dysfunctions for a specific building to Excel.
   * GET /api/gestion-parc/{pkImmeuble}/dysfonctionnements/export
   */
  const exportGestionParcDysfunctions = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/dysfonctionnements/export`,
        {
          responseType: "blob",
        }
      );
      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(
        response.data as unknown as Blob,
        `export-alarmestechniques-${pkImmeuble}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Generates and downloads an intervention report (PDF or Excel).
   * GET /api/gestion-parc/{pkImmeuble}/intervention
   */
  const getGestionParcInterventionReport = async (
    pkImmeuble: string | number,
    params: {
      docType: "synthese-inte" | "detail-inte" | "detail-excel-inte";
      dateBegin: string;
      dateEnd: string;
    }
  ): Promise<void> => {
    try {
      const { docType, dateBegin, dateEnd } = params;

      // Basic date format validation (d/m/Y)
      const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateFormatRegex.test(dateBegin) || !dateFormatRegex.test(dateEnd)) {
        throw new Error("Invalid date format. Expected format: DD/MM/YYYY.");
      }

      const response = await api.get<Blob>(
        `/gestion-parc/${pkImmeuble}/intervention`,
        {
          params: {
            "doc-type": docType,
            "date-begin": dateBegin,
            "date-end": dateEnd,
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const filename =
        response.headers["content-disposition"]?.split("filename=")[1]?.replace(/['"]/g, "") ||
        `${docType}-${dateBegin.replace(/\//g, "-")}-${dateEnd.replace(/\//g, "-")}.${
          contentType.includes("pdf") ? "pdf" : "xlsx"
        }`;

      // When responseType is "blob", response.data is a Blob, but TypeScript doesn't infer it
      downloadBlob(response.data as unknown as Blob, filename, contentType);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  return {
    // Queries
    getGestionParcIndexQuery,
    useGestionParcBuildingQuery,
    useGestionParcInterventionQuery,
    useGestionParcInterventionsQuery,
    useGestionParcFuitesQuery,
    useGestionParcAnomaliesQuery,
    useGestionParcDysfunctionsQuery,

    // Mutations
    filterGestionParcMutation,

    // Helper functions for direct calls/downloads
    getGestionParcIndex: getGestionParcIndexQuery.data,
    getGestionParcBuilding: useGestionParcBuildingQuery,
    getIntervention: useGestionParcInterventionQuery,
    getInterventions: useGestionParcInterventionsQuery,
    getFuites: useGestionParcFuitesQuery,
    getAnomalies: useGestionParcAnomaliesQuery,
    getDysfonctionnements: useGestionParcDysfunctionsQuery,
    filterGestionParc: filterGestionParcMutation.mutateAsync,
    getGestionParcReport,
    exportGestionParcAnomalies,
    exportGestionParcFuites,
    exportGestionParcInterventions,
    exportGestionParcDysfunctions,
    getGestionParcInterventionReport,

    // Loading states
    isGestionParcIndexLoading: getGestionParcIndexQuery.isLoading,
    isFilteringGestionParc: filterGestionParcMutation.isPending,

    // Errors
    gestionParcIndexError: getGestionParcIndexQuery.error
      ? handleApiError(getGestionParcIndexQuery.error)
      : null,
    filterGestionParcError: filterGestionParcMutation.error
      ? handleApiError(filterGestionParcMutation.error)
      : null,
  };
}

