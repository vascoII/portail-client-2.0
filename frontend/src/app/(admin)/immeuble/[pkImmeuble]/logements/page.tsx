import { Metadata } from "next";
import { Suspense } from "react";
import ListLogements from "@/components/techem/logement/ListLogements";

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 */
export const revalidate = 6 * 60 * 60; // 6 heures

export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string };
}): Promise<Metadata> {
  return {
    title: `Logements - Immeuble ${params.pkImmeuble} | TECHEM - Espace client`,
    description: `Liste des logements pour l'immeuble ${params.pkImmeuble}`,
  };
}

export default function ImmeubleLogementsPage({
  params,
}: {
  params: { pkImmeuble: string };
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chargement...
        </p>
      </div>
    }>
      <ListLogements pkImmeuble={params.pkImmeuble} />
    </Suspense>
  );
}

