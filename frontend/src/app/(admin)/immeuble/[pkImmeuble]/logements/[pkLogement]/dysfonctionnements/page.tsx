import { Metadata } from "next";
import ListDysfonctionnements from "@/components/techem/logement/ListDysfonctionnements";

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
    title: `Dysfonctionnements - Logement ${params.pkLogement} | TECHEM - Espace client`,
    description: `Liste des dysfonctionnements pour le logement ${params.pkLogement}`,
  };
}

export default function LogementDysfonctionnementsPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListDysfonctionnements pkLogement={params.pkLogement} />
      </div>
    </div>
  );
}


