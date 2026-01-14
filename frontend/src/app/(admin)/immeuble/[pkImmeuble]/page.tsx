import { Metadata } from "next";
import ImmeubleDetailsClient from "@/components/techem/immeuble/ImmeubleDetailsClient";

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 */
export const revalidate = 7200;

export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string };
}): Promise<Metadata> {
  return {
    title: `Immeuble ${params.pkImmeuble} | TECHEM - Espace client`,
    description: `Détails de l'immeuble ${params.pkImmeuble}`,
  };
}

export default function ImmeubleDetailsPage({
  params,
}: {
  params: { pkImmeuble: string };
}) {
  return <ImmeubleDetailsClient pkImmeuble={params.pkImmeuble} />;
}