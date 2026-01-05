/**
 * Export centralisé pour le système de cache
 */

// Persistance
export { createLocalStoragePersister } from "./persistQueryClient";

// Préchargement
export {
  prefetchLogement,
  prefetchLogementRelatedData,
  prefetchLogementComplete,
  prefetchLogementsByImmeuble,
} from "./prefetch";

// Hooks
export { usePrefetchOnHover } from "./usePrefetch";

