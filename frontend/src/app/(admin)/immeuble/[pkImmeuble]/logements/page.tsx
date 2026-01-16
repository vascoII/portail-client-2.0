import { Metadata } from "next";
import { Suspense } from "react";
import ListLogements from "@/components/techem/logement/ListLogements";

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 */
export const revalidate = 7200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkImmeuble: string }>;
}): Promise<Metadata> {
  const { pkImmeuble } = await params;
  return {
    title: `Logements - Immeuble ${pkImmeuble} | TECHEM - Espace client`,
    description: `Liste des logements pour l'immeuble ${pkImmeuble}`,
  };
}

export default async function ImmeubleLogementsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string }>;
}) {
  const { pkImmeuble } = await params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chargement...
        </p>
      </div>
    }>
      <ListLogements pkImmeuble={pkImmeuble} />
    </Suspense>
  );
}

