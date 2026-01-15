import { Metadata } from "next";
import ListDysfonctionnements from "@/components/techem/logement/ListDysfonctionnements";

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
    title: `Dysfonctionnements - Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Liste des dysfonctionnements pour le logement ${pkLogement}`,
  };
}

export default async function LogementDysfonctionnementsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string; pkLogement: string }>;
}) {
  const { pkLogement } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListDysfonctionnements pkLogement={pkLogement} />
      </div>
    </div>
  );
}


