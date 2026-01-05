import { Metadata } from "next";
import ListFuites from "@/components/techem/logement/ListFuites";

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
    title: `Fuites - Logement ${params.pkLogement} | TECHEM - Espace client`,
    description: `Liste des fuites pour le logement ${params.pkLogement}`,
  };
}

export default function LogementFuitesPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListFuites pkLogement={params.pkLogement} />
      </div>
    </div>
  );
}


