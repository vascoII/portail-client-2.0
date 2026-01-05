import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  BuildingDetailsResponse,
  Building,
  InterventionDetails,
  Intervention,
  DepannageRecord,
  AnomalyListResponse,
  LeakListResponse,
  DysfunctionListResponse,
  FilterParams,
  FilterValues,
} from "@/lib/types/api";

/* eslint-disable react-hooks/rules-of-hooks */

/**
 * Parameters for filtering buildings
 */
export interface FilterImmeublesParams extends FilterParams {
  search?: boolean;
}

/**
 * Parameters for building report request
 */
export interface BuildingReportParams {
  type: string | null; // null for 'repartition', or specific type
  energie: string; // e.g., 'CHAUFFAGE', 'EAU'
  date?: string; // Optional date parameter
}

/**
 * Parameters for intervention report request
 */
export interface InterventionReportParams {
  docType: "synthese-inte" | "detail-inte" | "detail-excel-inte";
  dateBegin: string; // Format: d/m/Y
  dateEnd: string; // Format: d/m/Y
}

/**
 * Response from /api/immeubles endpoint
 */
export interface ImmeublesIndexResponse {
  board: Record<string, unknown>;
  filters: FilterValues;
}

/**
 * Response from /api/immeubles/filtre endpoint
 */
export interface FilterImmeublesResponse {
  immeubles: Building[];
  gestion?: boolean;
}

interface RawImmeubleEntry {
  Immeuble?: Record<string, unknown>;
  immeuble?: Record<string, unknown>;
  [key: string]: unknown;
}

interface FilterImmeublesApiResponse {
  immeubles: RawImmeubleEntry[];
  gestion?: boolean;
}

const toStringOrEmpty = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const normalizeNumber = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }
  return undefined;
};

const pickValue = (
  sources: Array<Record<string, unknown> | undefined>,
  keys: string[]
): unknown => {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        return source[key];
      }
    }
  }
  return undefined;
};

const normalizeImmeubleEntry = (entry: RawImmeubleEntry): Building => {
  const immeubleInfo = (entry.Immeuble ?? entry.immeuble ?? {}) as Record<string, unknown>;
  const sources = [immeubleInfo, entry];

  const getStringField = (field: string): string => {
    const camel = field.charAt(0).toLowerCase() + field.slice(1);
    return toStringOrEmpty(pickValue(sources, [field, camel]));
  };

  const building: Building = {
    PkImmeuble: getStringField("PkImmeuble"),
    Numero: getStringField("Numero"),
    Nom: getStringField("Nom"),
    Adresse1: getStringField("Adresse1"),
    Adresse2: getStringField("Adresse2"),
    Adresse3: getStringField("Adresse3"),
    Cp: getStringField("Cp"),
    Ville: getStringField("Ville"),
    Ref: getStringField("Ref"),
    DateActivationClient: getStringField("DateActivationClient"),
    DateActivationOccupant: getStringField("DateActivationOccupant"),
    FkClientTop: getStringField("FkClientTop"),
  };
  const buildingRecord = building as Record<string, unknown>;

  const applyBooleanField = (field: string) => {
    const camel = field.charAt(0).toLowerCase() + field.slice(1);
    const boolValue = normalizeBoolean(pickValue(sources, [field, camel]));
    if (boolValue !== undefined) {
      buildingRecord[field] = boolValue;
    }
  };

  ["HasTelereleve", "HasNoteOccupant", "HasDecompteOccupant", "HasFactures", "HasChantiers", "Actif"].forEach(
    applyBooleanField
  );

  const applyNumericField = (field: string) => {
    const camel = field.charAt(0).toLowerCase() + field.slice(1);
    const value = pickValue(sources, [field, camel]);
    if (value !== undefined) {
      buildingRecord[field] = normalizeNumber(value);
    }
  };

  [
    "NbLogements",
    "NbAppareils",
    "NbCompteursEC",
    "NbCompteursEF",
    "NbCompteursRepart",
    "NbCompteursCET",
    "NbCompteursCapteur",
    "NbCompteursElect",
    "NbCompteursGaz",
    "NbCompteurs",
    "NbFuites",
    "NbDepannages",
    "NbDysfonctionnements",
    "NbAnomalies",
  ].forEach(applyNumericField);

  return building;
};

/**
 * Response from /api/immeubles/{pkImmeuble}/interventions/{pkIntervention}
 */
export interface InterventionResponse {
  immeuble: Building;
  depannage: InterventionDetails;
}

/**
 * Response from /api/immeubles/{pkImmeuble}/interventions
 */
export interface InterventionsListResponse {
  immeuble: Building;
  depannages: DepannageRecord[];
  filters?: FilterValues;
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
 * Custom hook for Immeubles (Buildings) API endpoints
 *
 * Provides all building-related API calls including:
 * - Building list and filtering
 * - Building details
 * - Interventions, leaks, anomalies, dysfunctions
 * - Reports and exports
 *
 * @example
 * ```tsx
 * const { getImmeubles, getImmeuble, getInterventions, exportAnomalies } = useImmeubles();
 *
 * // Get building list
 * const buildings = await getImmeubles();
 *
 * // Get building details
 * const building = await getImmeuble("12345");
 *
 * // Export anomalies
 * await exportAnomalies("12345");
 * ```
 */
export function useImmeubles() {
  const queryClient = useQueryClient();

  /**
   * Get buildings dashboard query
   * GET /api/immeubles
   */
  const immeublesQuery = useQuery({
    queryKey: ["immeubles", "index"],
    queryFn: async (): Promise<ImmeublesIndexResponse> => {
      const response = await api.get<ImmeublesIndexResponse>("/immeubles");
      return extractApiData<ImmeublesIndexResponse>(response);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
  });

  /**
   * Get buildings list
   * Refetches the immeubles query
   * @returns Promise with buildings dashboard data
   */
  const getImmeubles = async (): Promise<ImmeublesIndexResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", "index"],
      queryFn: async (): Promise<ImmeublesIndexResponse> => {
        const response = await api.get<ImmeublesIndexResponse>("/immeubles");
        return extractApiData<ImmeublesIndexResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Filter buildings mutation
   * GET/POST /api/immeubles/filtre
   * @param params - Filter parameters
   * @returns Promise with filtered buildings
   */
  const filterImmeublesMutation = useMutation({
    mutationFn: async (
      params: FilterImmeublesParams
    ): Promise<FilterImmeublesResponse> => {
      const response = await api.post<FilterImmeublesApiResponse>(
        "/immeubles/filtre",
        params
      );
      const raw = extractApiData<FilterImmeublesApiResponse>(response);
      return {
        ...raw,
        immeubles: (raw.immeubles ?? []).map(normalizeImmeubleEntry),
      };
    },
  });

  /**
   * Filter buildings
   * @param params - Filter parameters
   * @returns Promise with filtered buildings
   */
  const filterImmeubles = async (
    params: FilterImmeublesParams
  ): Promise<FilterImmeublesResponse> => {
    return filterImmeublesMutation.mutateAsync(params);
  };

  /**
   * Get building details query
   * GET /api/immeubles/{pkImmeuble}
   * @param pkImmeuble - Building ID
   */
  const getImmeubleQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble],
      queryFn: async (): Promise<BuildingDetailsResponse> => {
        const response = await api.get<BuildingDetailsResponse>(
          `/immeubles/${pkImmeuble}`
        );
        return extractApiData<BuildingDetailsResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get building details
   * @param pkImmeuble - Building ID
   * @returns Promise with building details
   */
  const getImmeuble = async (
    pkImmeuble: string | number
  ): Promise<BuildingDetailsResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble],
      queryFn: async (): Promise<BuildingDetailsResponse> => {
        const response = await api.get<BuildingDetailsResponse>(
          `/immeubles/${pkImmeuble}`
        );
        return extractApiData<BuildingDetailsResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get intervention details query
   * GET /api/immeubles/{pkImmeuble}/interventions/{pkIntervention}
   * @param pkImmeuble - Building ID
   * @param pkIntervention - Intervention ID
   */
  const getInterventionQuery = (
    pkImmeuble: string | number,
    pkIntervention: string | number
  ) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble, "interventions", pkIntervention],
      queryFn: async (): Promise<InterventionResponse> => {
        const response = await api.get<InterventionResponse>(
          `/immeubles/${pkImmeuble}/interventions/${pkIntervention}`
        );
        return extractApiData<InterventionResponse>(response);
      },
      enabled: !!pkImmeuble && !!pkIntervention,
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get intervention details
   * @param pkImmeuble - Building ID
   * @param pkIntervention - Intervention ID
   * @returns Promise with intervention details
   */
  const getIntervention = async (
    pkImmeuble: string | number,
    pkIntervention: string | number
  ): Promise<InterventionResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble, "interventions", pkIntervention],
      queryFn: async (): Promise<InterventionResponse> => {
        const response = await api.get<InterventionResponse>(
          `/immeubles/${pkImmeuble}/interventions/${pkIntervention}`
        );
        return extractApiData<InterventionResponse>(response);
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get interventions list query
   * GET /api/immeubles/{pkImmeuble}/interventions
   * @param pkImmeuble - Building ID
   */
  const getInterventionsQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble, "interventions"],
      queryFn: async (): Promise<InterventionsListResponse> => {
        const response = await api.get<InterventionsListResponse>(
          `/immeubles/${pkImmeuble}/interventions`
        );
        return extractApiData<InterventionsListResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
  };

  /**
   * Get interventions list
   * @param pkImmeuble - Building ID
   * @returns Promise with interventions list
   */
  const getInterventions = async (
    pkImmeuble: string | number
  ): Promise<InterventionsListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble, "interventions"],
      queryFn: async (): Promise<InterventionsListResponse> => {
        const response = await api.get<InterventionsListResponse>(
          `/immeubles/${pkImmeuble}/interventions`
        );
        return extractApiData<InterventionsListResponse>(response);
      },
      retry: false,
      staleTime: 2 * 60 * 1000,
    });
    return result;
  };

  /**
   * Get leaks list query
   * GET /api/immeubles/{pkImmeuble}/fuites
   * @param pkImmeuble - Building ID
   */
  const getFuitesQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble, "fuites"],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/immeubles/${pkImmeuble}/fuites`
        );
        return extractApiData<LeakListResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get leaks list
   * @param pkImmeuble - Building ID
   * @returns Promise with leaks list
   */
  const getFuites = async (
    pkImmeuble: string | number
  ): Promise<LeakListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble, "fuites"],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/immeubles/${pkImmeuble}/fuites`
        );
        return extractApiData<LeakListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get anomalies list query
   * GET /api/immeubles/{pkImmeuble}/anomalies
   * @param pkImmeuble - Building ID
   */
  const getAnomaliesQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble, "anomalies"],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/immeubles/${pkImmeuble}/anomalies`
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get anomalies list
   * @param pkImmeuble - Building ID
   * @returns Promise with anomalies list
   */
  const getAnomalies = async (
    pkImmeuble: string | number
  ): Promise<AnomalyListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble, "anomalies"],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/immeubles/${pkImmeuble}/anomalies`
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get dysfunctions list query
   * GET /api/immeubles/{pkImmeuble}/dysfonctionnements
   * @param pkImmeuble - Building ID
   */
  const getDysfonctionnementsQuery = (pkImmeuble: string | number) => {
    return useQuery({
      queryKey: ["immeubles", pkImmeuble, "dysfonctionnements"],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/immeubles/${pkImmeuble}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      enabled: !!pkImmeuble,
      retry: false,
      staleTime: getStaleTimeUntilMidnight(), // Cache until midnight (SOAP data updated once per night at 2 AM)
    });
  };

  /**
   * Get dysfunctions list
   * @param pkImmeuble - Building ID
   * @returns Promise with dysfunctions list
   */
  const getDysfonctionnements = async (
    pkImmeuble: string | number
  ): Promise<DysfunctionListResponse> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["immeubles", pkImmeuble, "dysfonctionnements"],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/immeubles/${pkImmeuble}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      retry: false,
      staleTime: getStaleTimeUntilMidnight(),
    });
    return result;
  };

  /**
   * Get building report (PDF)
   * GET/POST /api/immeubles/{pkImmeuble}/releve/{type}/{energie}
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @param params - Report parameters (type, energie, date?)
   * @returns Promise that resolves when download is complete
   */
  const getReport = async (
    pkImmeuble: string | number,
    params: BuildingReportParams
  ): Promise<void> => {
    try {
      // Handle 'repartition' type (converted to null in API)
      const typeParam = params.type === "repartition" ? "repartition" : params.type || "";

      const requestParams: Record<string, string> = {};
      if (params.date) {
        requestParams.date = params.date;
      }

      // Make request with blob response type
      const response = await api.get(
        `/immeubles/${pkImmeuble}/releve/${typeParam}/${params.energie}`,
        {
          params: requestParams,
          responseType: "blob",
        }
      );

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      // Generate filename
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `relevé-${dateStr}.pdf`;

      // Download the file
      downloadBlob(blob, filename);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to download report: ${errorMessage}`);
    }
  };

  /**
   * Export anomalies to Excel
   * GET /api/immeubles/{pkImmeuble}/anomalies/export
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const exportAnomalies = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/immeubles/${pkImmeuble}/anomalies/export`,
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
   * GET /api/immeubles/{pkImmeuble}/fuites/export
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const exportFuites = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/immeubles/${pkImmeuble}/fuites/export`,
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
   * GET /api/immeubles/{pkImmeuble}/interventions/export
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const exportInterventions = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/immeubles/${pkImmeuble}/interventions/export`,
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
   * GET /api/immeubles/{pkImmeuble}/dysfonctionnements/export
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @returns Promise that resolves when download is complete
   */
  const exportDysfonctionnements = async (
    pkImmeuble: string | number
  ): Promise<void> => {
    try {
      const response = await api.get(
        `/immeubles/${pkImmeuble}/dysfonctionnements/export`,
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
   * Export immeubles list to Excel
   * GET /api/immeubles/export
   * Downloads the file automatically
   * @returns Promise that resolves when download is complete
   */
  const exportImmeubles = async (): Promise<void> => {
    try {
      const response = await api.get(
        `/immeubles/export`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, "export-immeubles.xlsx");
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(`Failed to export immeubles: ${errorMessage}`);
    }
  };

  /**
   * Get intervention report (PDF or Excel)
   * GET /api/immeubles/{pkImmeuble}/intervention
   * Downloads the file automatically
   * @param pkImmeuble - Building ID
   * @param params - Report parameters (docType, dateBegin, dateEnd)
   * @returns Promise that resolves when download is complete
   */
  const getInterventionReport = async (
    pkImmeuble: string | number,
    params: InterventionReportParams
  ): Promise<void> => {
    try {
      // Validate date format (d/m/Y)
      const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (
        !dateFormatRegex.test(params.dateBegin) ||
        !dateFormatRegex.test(params.dateEnd)
      ) {
        throw new Error(
          "Invalid date format. Expected format: d/m/Y (e.g., 01/01/2024)"
        );
      }

      // Determine file extension based on docType
      const isExcel = params.docType === "detail-excel-inte";
      const fileExtension = isExcel ? "xlsx" : "pdf";
      const filename = `${params.docType}-${params.dateBegin}-${params.dateEnd}.${fileExtension}`;

      // Make request with blob response type
      const response = await api.get(
        `/immeubles/${pkImmeuble}/intervention`,
        {
          params: {
            "doc-type": params.docType,
            "date-begin": params.dateBegin,
            "date-end": params.dateEnd,
          },
          responseType: "blob",
        }
      );

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: isExcel
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });

      // Download the file
      downloadBlob(blob, filename);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(
        `Failed to download intervention report: ${errorMessage}`
      );
    }
  };

  return {
    // Query functions (async functions that refetch)
    getImmeubles,
    getImmeuble,
    getIntervention,
    getInterventions,
    getFuites,
    getAnomalies,
    getDysfonctionnements,

    // Mutation functions
    filterImmeubles,

    // Export/Download functions
    getReport,
    exportImmeubles,
    exportAnomalies,
    exportFuites,
    exportInterventions,
    exportDysfonctionnements,
    getInterventionReport,

    // Mutation states
    isFiltering: filterImmeublesMutation.isPending,
    filterError: filterImmeublesMutation.error
      ? handleApiError(filterImmeublesMutation.error)
      : null,

    // Query states (from reactive queries)
    immeublesData: immeublesQuery.data,
    immeublesIsLoading: immeublesQuery.isLoading,
    immeublesError: immeublesQuery.error
      ? handleApiError(immeublesQuery.error)
      : null,

    // Query hooks for reactive usage (with parameters)
    getImmeubleQuery,
    getInterventionQuery,
    getInterventionsQuery,
    getFuitesQuery,
    getAnomaliesQuery,
    getDysfonctionnementsQuery,

    // Direct access to mutations/queries for advanced usage
    filterImmeublesMutation,
    immeublesQuery,
  };
}

