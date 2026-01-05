import { Metadata } from "next";

import ImmeubleCard from "@/components/techem/immeuble/ImmeubleCard";

import LogementMainCard from "@/components/techem/logement/LogementMainCard";
import { LogementMetrics } from "@/components/techem/logement/LogementMetrics";
import LogementRelevesCard from "@/components/techem/logement/LogementRelevesCard";
import LogementDetailsClient from "@/components/techem/logement/LogementDetailsClient";

/**
 * Génère les métadonnées pour la page logement
 * 
 * Les métadonnées sont dynamiques mais peuvent être mises en cache
 * par Next.js pour améliorer les performances SEO.
 */
export async function generateMetadata({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}): Promise<Metadata> {
  const { pkLogement } = params;

  return {
    title: `Logement ${pkLogement} | TECHEM - Espace client`,
    description: `Détails du logement ${pkLogement}`,
  };
}

/**
 * Revalidation ISR : Revalider toutes les 6 heures
 * 
 * Cette configuration permet à Next.js de :
 * - Servir la page depuis le cache (rapide)
 * - Revalider en arrière-plan toutes les 6 heures
 * - Mettre à jour le cache si les données ont changé
 */
export const revalidate = 6 * 60 * 60; // 6 heures

/**
 * Page de détails d'un logement
 * 
 * Cette page utilise ISR (Incremental Static Regeneration) pour
 * optimiser les performances. La page est générée à la demande
 * et mise en cache pendant 6 heures.
 */
export default function LogementDetailsPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  const { pkLogement, pkImmeuble } = params;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <LogementMainCard pkLogement={pkLogement} />
        <LogementMetrics pkLogement={pkLogement} pkImmeuble={pkImmeuble} />
        
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-5">
        <ImmeubleCard pkImmeuble={pkImmeuble} />
        <LogementRelevesCard pkLogement={pkLogement} />
      </div>
      <LogementDetailsClient pkLogement={pkLogement} />
      
    </div>
  );
}


