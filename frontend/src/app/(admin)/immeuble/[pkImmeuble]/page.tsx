import { Metadata } from "next";
import ImmeubleDetailsClient from "@/components/techem/immeuble/ImmeubleDetailsClient";

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
    title: `Immeuble ${pkImmeuble} | TECHEM - Espace client`,
    description: `Détails de l'immeuble ${pkImmeuble}`,
  };
}

export default async function ImmeubleDetailsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string }>;
}) {
  const { pkImmeuble } = await params;
  return <ImmeubleDetailsClient pkImmeuble={pkImmeuble} />;
}