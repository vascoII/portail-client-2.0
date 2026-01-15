import { Metadata } from "next";
import ListInterventions from "@/components/techem/logement/ListInterventions";

/**
 * Revalidation ISR : Revalider toutes les 2 heures (données dynamiques)
 */
export const revalidate = 7200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string; pkIntervention: string }>;
}): Promise<Metadata> {
  const { pkIntervention, pkLogement } = await params;
  return {
    title: `Intervention ${pkIntervention} - Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Détails de l'intervention ${pkIntervention} pour le logement ${pkLogement}`,
  };
}

export default async function LogementInterventionDetailsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string; pkIntervention: string }>;
}) {
  const { pkLogement } = await params;
  // Reuse ListInterventions for now; component handles selection internally
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkLogement={pkLogement} />
      </div>
    </div>
  );
}


