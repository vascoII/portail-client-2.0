"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";
import { createLocalStoragePersister } from "@/lib/cache/persistQueryClient";

/**
 * Providers component that wraps the application with React Query
 * This component must be a client component ("use client")
 * 
 * Features:
 * - Persistent cache (survives page refresh)
 * - localStorage storage (fast and reliable)
 * - Optimized cache settings for logement pages
 * - Offline-first network mode
 */
export default function Providers({ children }: { children: ReactNode }) {
  // Create a QueryClient instance with default options
  // Using useState to ensure the client is created only once per component instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: unused data is kept in cache for 24 hours (optimized for logement data)
            gcTime: 24 * 60 * 60 * 1000, // 24h pour données logement
            // Retry failed requests 1 time
            retry: 1,
            // Don't refetch on window focus (avoid unnecessary refetches)
            refetchOnWindowFocus: false,
            // Refetch on reconnect (important for offline support)
            refetchOnReconnect: true,
            // Don't refetch on mount if data is fresh (use cache)
            refetchOnMount: false,
            // Network mode: use cache if offline
            networkMode: "offlineFirst",
            // Keep previous data while refetching (better UX)
            placeholderData: (previousData) => previousData,
          },
          mutations: {
            // Retry failed mutations 0 times (mutations should not retry by default)
            retry: 0,
          },
        },
      })
  );

  // Create persister (synchronous, works immediately)
  const persister = createLocalStoragePersister();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: "1.0.0", // Version du cache (incrémenter pour invalider tout le cache)
        dehydrateOptions: {
          // Persister uniquement les queries logement et immeubles
          shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey[0];
            return (
              queryKey === "logements" ||
              queryKey === "immeubles" ||
              queryKey === "parc" ||
              queryKey === "gestion-parc"
            );
          },
        },
      }}
    >
      {children}
      {/* React Query DevTools - only shown in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
}

