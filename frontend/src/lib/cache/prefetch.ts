/**
 * Fonctions de préchargement pour optimiser les performances
 * 
 * Ces fonctions permettent de précharger les données avant que
 * l'utilisateur ne navigue vers une page, réduisant ainsi la
 * latence perçue.
 */

import { QueryClient } from "@tanstack/react-query";
import { api, extractApiData } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type {
  HousingDetailsResponse,
  LeakListResponse,
  AnomalyListResponse,
  DysfunctionListResponse,
  LogementInterventionsListResponse,
  LogementsByImmeubleResponse,
} from "@/lib/types/api";

/**
 * Précharge les données principales d'un logement
 * 
 * @param queryClient - Instance de QueryClient
 * @param pkLogement - ID du logement
 */
export async function prefetchLogement(
  queryClient: QueryClient,
  pkLogement: string | number
): Promise<void> {
  // Précharger les données principales
  await queryClient.prefetchQuery({
    queryKey: ["logements", pkLogement],
    queryFn: async (): Promise<HousingDetailsResponse> => {
      const response = await api.get<HousingDetailsResponse>(
        `/logements/${pkLogement}`
      );
      return extractApiData<HousingDetailsResponse>(response);
    },
    staleTime: getStaleTimeUntilMidnight(),
  });
}

/**
 * Précharge les données liées d'un logement (en parallèle)
 * 
 * @param queryClient - Instance de QueryClient
 * @param pkLogement - ID du logement
 */
export async function prefetchLogementRelatedData(
  queryClient: QueryClient,
  pkLogement: string | number
): Promise<void> {
  // Précharger les données liées en parallèle
  await Promise.all([
    // Interventions
    queryClient.prefetchQuery({
      queryKey: ["logements", pkLogement, "interventions"],
      queryFn: async (): Promise<LogementInterventionsListResponse> => {
        const response = await api.get<LogementInterventionsListResponse>(
          `/logements/${pkLogement}/interventions`
        );
        return extractApiData<LogementInterventionsListResponse>(response);
      },
      staleTime: 2 * 60 * 1000, // 2 minutes pour données dynamiques
    }),
    // Fuites
    queryClient.prefetchQuery({
      queryKey: ["logements", pkLogement, "fuites"],
      queryFn: async (): Promise<LeakListResponse> => {
        const response = await api.get<LeakListResponse>(
          `/logements/${pkLogement}/fuites`
        );
        return extractApiData<LeakListResponse>(response);
      },
      staleTime: getStaleTimeUntilMidnight(),
    }),
    // Anomalies
    queryClient.prefetchQuery({
      queryKey: ["logements", pkLogement, "anomalies"],
      queryFn: async (): Promise<AnomalyListResponse> => {
        const response = await api.get<AnomalyListResponse>(
          `/logements/${pkLogement}/anomalies`
        );
        return extractApiData<AnomalyListResponse>(response);
      },
      staleTime: getStaleTimeUntilMidnight(),
    }),
    // Dysfonctionnements
    queryClient.prefetchQuery({
      queryKey: ["logements", pkLogement, "dysfonctionnements"],
      queryFn: async (): Promise<DysfunctionListResponse> => {
        const response = await api.get<DysfunctionListResponse>(
          `/logements/${pkLogement}/dysfonctionnements`
        );
        return extractApiData<DysfunctionListResponse>(response);
      },
      staleTime: getStaleTimeUntilMidnight(),
    }),
  ]);
}

/**
 * Précharge toutes les données d'un logement (principales + liées)
 * 
 * @param queryClient - Instance de QueryClient
 * @param pkLogement - ID du logement
 */
export async function prefetchLogementComplete(
  queryClient: QueryClient,
  pkLogement: string | number
): Promise<void> {
  await Promise.all([
    prefetchLogement(queryClient, pkLogement),
    prefetchLogementRelatedData(queryClient, pkLogement),
  ]);
}

/**
 * Précharge les logements d'un immeuble (pour navigation probable)
 * 
 * @param queryClient - Instance de QueryClient
 * @param pkImmeuble - ID de l'immeuble
 */
export async function prefetchLogementsByImmeuble(
  queryClient: QueryClient,
  pkImmeuble: string | number
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ["logements", "immeuble", pkImmeuble],
    queryFn: async (): Promise<LogementsByImmeubleResponse> => {
      const response = await api.get<LogementsByImmeubleResponse>(
        `/logements/immeuble/${pkImmeuble}`
      );
      return extractApiData<LogementsByImmeubleResponse>(response);
    },
    staleTime: getStaleTimeUntilMidnight(),
  });
}

