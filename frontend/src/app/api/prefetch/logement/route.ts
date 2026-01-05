/**
 * Route handler pour préchargement de données logement
 * 
 * GET /api/prefetch/logement?pkLogement=123
 * 
 * Cette route permet de précharger les données d'un logement
 * côté serveur, utile pour le SSR ou les optimisations.
 */

import { NextRequest, NextResponse } from "next/server";
import { QueryClient } from "@tanstack/react-query";
import { prefetchLogement, prefetchLogementComplete } from "@/lib/cache/prefetch";

/**
 * GET /api/prefetch/logement
 * 
 * Précharge les données d'un logement
 * 
 * Query parameters:
 * - pkLogement (required): ID du logement
 * - complete (optional): Si "true", précharge aussi les données liées
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pkLogement = searchParams.get("pkLogement");
  const complete = searchParams.get("complete") === "true";

  if (!pkLogement) {
    return NextResponse.json(
      { error: "pkLogement parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Créer un QueryClient temporaire pour préchargement
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 5 * 60 * 1000,
        },
      },
    });

    // Précharger les données
    if (complete) {
      await prefetchLogementComplete(queryClient, pkLogement);
    } else {
      await prefetchLogement(queryClient, pkLogement);
    }

    // Récupérer les données préchargées
    const data = queryClient.getQueryData(["logements", pkLogement]);

    return NextResponse.json({
      success: true,
      pkLogement,
      hasData: !!data,
      message: complete
        ? "Logement data and related data prefetched"
        : "Logement data prefetched",
    });
  } catch (error) {
    console.error("Prefetch failed:", error);
    return NextResponse.json(
      {
        error: "Prefetch failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

