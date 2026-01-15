import { Metadata } from "next";
import ListInterventions from "@/components/techem/logement/ListInterventions";

/**
 * Revalidation ISR : Revalider toutes les 2 heures (données plus dynamiques)
 */
export const revalidate = 7200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}): Promise<Metadata> {
  const { pkLogement } = await params;
  return {
    title: `Interventions - Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Liste des interventions pour le logement ${pkLogement}`,
  };
}

export default async function LogementInterventionsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}) {
  const { pkLogement } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkLogement={pkLogement} />
      </div>
    </div>
  );
}


