/**
 * Hook pour préchargement au hover
 * 
 * Utilise ce hook dans les composants pour précharger
 * les données lorsqu'un utilisateur survole un lien.
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  prefetchLogement,
  prefetchLogementComplete,
  prefetchLogementsByImmeuble,
} from "./prefetch";

/**
 * Hook pour précharger un logement au hover
 * 
 * @example
 * ```tsx
 * const { prefetchOnHover } = usePrefetchOnHover();
 * 
 * <Link
 *   href={`/immeuble/${pkImmeuble}/logements/${pkLogement}`}
 *   onMouseEnter={() => prefetchOnHover(pkLogement)}
 * >
 *   {logement.Nom}
 * </Link>
 * ```
 */
export function usePrefetchOnHover() {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback(
    (pkLogement: string | number) => {
      // Précharger uniquement les données principales (légères)
      // Les données liées seront chargées à la demande
      prefetchLogement(queryClient, pkLogement).catch((error) => {
        // Ignorer les erreurs de préchargement (non bloquant)
        if (process.env.NODE_ENV === "development") {
          console.warn("Prefetch failed:", error);
        }
      });
    },
    [queryClient]
  );

  const prefetchCompleteOnHover = useCallback(
    (pkLogement: string | number) => {
      // Précharger toutes les données (principales + liées)
      prefetchLogementComplete(queryClient, pkLogement).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Complete prefetch failed:", error);
        }
      });
    },
    [queryClient]
  );

  const prefetchImmeubleLogements = useCallback(
    (pkImmeuble: string | number) => {
      // Précharger la liste des logements d'un immeuble
      prefetchLogementsByImmeuble(queryClient, pkImmeuble).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Immeuble logements prefetch failed:", error);
        }
      });
    },
    [queryClient]
  );

  return {
    prefetchOnHover,
    prefetchCompleteOnHover,
    prefetchImmeubleLogements,
  };
}

