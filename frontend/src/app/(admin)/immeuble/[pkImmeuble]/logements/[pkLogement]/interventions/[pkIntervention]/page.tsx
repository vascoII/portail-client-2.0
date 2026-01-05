import { Metadata } from "next";
import ListInterventions from "@/components/techem/logement/ListInterventions";

/**
 * Revalidation ISR : Revalider toutes les 2 heures (données dynamiques)
 */
export const revalidate = 2 * 60 * 60; // 2 heures

export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string; pkIntervention: string };
}): Promise<Metadata> {
  return {
    title: `Intervention ${params.pkIntervention} - Logement ${params.pkLogement} | TECHEM - Espace client`,
    description: `Détails de l'intervention ${params.pkIntervention} pour le logement ${params.pkLogement}`,
  };
}

export default function LogementInterventionDetailsPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string; pkIntervention: string };
}) {
  // Reuse ListInterventions for now; component handles selection internally
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkLogement={params.pkLogement} />
      </div>
    </div>
  );
}


