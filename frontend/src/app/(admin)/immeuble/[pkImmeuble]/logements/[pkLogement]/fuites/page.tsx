import { Metadata } from "next";
import ListFuites from "@/components/techem/logement/ListFuites";

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
    title: `Fuites - Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Liste des fuites pour le logement ${pkLogement}`,
  };
}

export default async function LogementFuitesPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}) {
  const { pkLogement } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListFuites pkLogement={pkLogement} />
      </div>
    </div>
  );
}


