import { Metadata } from "next";
import ListAnomalies from "@/components/techem/logement/ListAnomalies";

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 */
export const revalidate = 6 * 60 * 60; // 6 heures

export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}): Promise<Metadata> {
  return {
    title: `Anomalies - Logement ${params.pkLogement} | TECHEM - Espace client`,
    description: `Liste des anomalies pour le logement ${params.pkLogement}`,
  };
}

export default function LogementAnomaliesPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListAnomalies pkLogement={params.pkLogement} />
      </div>
    </div>
  );
}


