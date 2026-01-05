import { Metadata } from "next";
import StatsOperators from "@/components/techem/operator/StatsOperators";

export const metadata: Metadata = {
  title: "Statistiques gestionnaires | TECHEM - Espace client",
  description: "Statistiques de connexions mensuelles des gestionnaires",
};

export default function StatistiquesPage() {
  return (
    <div className="col-span-12 xl:col-span-7 space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Connexions uniques mensuelles
          </h1>
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Un peu d&apos;explication</p>
            <p>
              La statistique de connexion unique des utilisateurs ci-dessous mesure
              combien de visiteurs distincts accèdent à leur page logement par
              mois. Contrairement aux simples &quot;vues de page&quot;, qui
              comptent chaque visite même si un utilisateur revient plusieurs
              fois, cette statistique essaie de ne compter chaque individu
              qu’une seule fois par période (1 mois).
            </p>
          </div>
        </div>

        <StatsOperators />
    </div>
  );
}
