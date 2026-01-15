import { Metadata } from "next";
import ListAnomalies from "@/components/techem/logement/ListAnomalies";

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 */
export const revalidate = 7200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}): Promise<Metadata> {
  const { pkLogement } = await params;
  return {
    title: `Anomalies - Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Liste des anomalies pour le logement ${pkLogement}`,
  };
}

export default async function LogementAnomaliesPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}) {
  const { pkLogement } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListAnomalies pkLogement={pkLogement} />
      </div>
    </div>
  );
}


