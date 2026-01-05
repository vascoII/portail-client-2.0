import { Metadata } from "next";
import { Suspense } from "react";
import ListOperators from "@/components/techem/operator/ListOperators";

export const metadata: Metadata = {
  title: "Gestionnaires | TECHEM - Espace client",
  description: "Liste des gestionnaires",
};

export default function GestionnairePage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <Suspense fallback={
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chargement des gestionnaires...
              </p>
            </div>
          </div>
        }>
          <ListOperators />
        </Suspense>
      </div>
    </div>
  );
}

