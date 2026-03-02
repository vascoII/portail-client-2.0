import { Metadata } from "next";
import { Suspense } from "react";
import ListLogementsAllImmeubles from "@/components/techem/logement/ListLogementsAllImmeubles";

export const metadata: Metadata = {
  title: "Logements | TECHEM - Espace client",
  description: "Résultats de recherche de logements",
};

export default function LogementsPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chargement des logements...
              </p>
            </div>
          }
        >
          <ListLogementsAllImmeubles />
        </Suspense>
      </div>
    </div>
  );
}

