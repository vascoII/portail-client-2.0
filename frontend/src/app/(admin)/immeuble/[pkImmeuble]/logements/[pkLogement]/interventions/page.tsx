import { Metadata } from "next";
import ListInterventions from "@/components/techem/logement/ListInterventions";

/**
 * Revalidation ISR : Revalider toutes les 2 heures (données plus dynamiques)
 */
export const revalidate = 2 * 60 * 60; // 2 heures (plus fréquent car données dynamiques)

export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}): Promise<Metadata> {
  return {
    title: `Interventions - Logement ${params.pkLogement} | TECHEM - Espace client`,
    description: `Liste des interventions pour le logement ${params.pkLogement}`,
  };
}

export default function LogementInterventionsPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkLogement={params.pkLogement} />
      </div>
    </div>
  );
}


