/**
 * Configuration de persistance pour React Query
 * 
 * Implémente une stratégie de cache persistant avec localStorage.
 * Le cache survit aux rafraîchissements de page et améliore
 * significativement les performances de chargement.
 * 
 * Note: IndexedDB peut être ajouté plus tard pour gérer
 * de très grandes quantités de données (> 5MB).
 */

import { Persister } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Crée un persister pour localStorage
 * 
 * localStorage est rapide et suffisant pour la plupart des cas.
 * Limite: ~5-10MB selon le navigateur.
 */
export function createLocalStoragePersister(): Persister {
  if (typeof window === "undefined") {
    // Server-side: retourner un persister no-op
    return {
      persistClient: async () => {},
      restoreClient: async () => undefined,
      removeClient: async () => {},
    };
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: "TECHEM_QUERY_CACHE",
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    // Compression optionnelle (peut être ajoutée plus tard)
    // compress: true,
  });
}

