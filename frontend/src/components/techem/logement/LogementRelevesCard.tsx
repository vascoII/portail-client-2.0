"use client";
import React, { useMemo } from "react";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingCard } from "@/components/ui/loading";

interface LogementRelevesCardProps {
  pkLogement: string;
}

export default function LogementRelevesCard({ pkLogement }: LogementRelevesCardProps) {
  const { getLogementQuery } = useLogements();
  const { data: logementData, isLoading: isLogementLoading } = getLogementQuery(pkLogement);

  // Extract logement information from API response
  // HasTelereleve is typically at the immeuble level, so we access it via logement.Immeuble
  const logementInfo = useMemo(() => {
    const logement = logementData?.logement;
    const immeuble = logement?.Immeuble;
    return {
      hasTelereleve: (immeuble?.HasTelereleve ?? immeuble?.hasTelereleve ?? false) as boolean,
    };
  }, [logementData]);


  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations de relève du logement 
          </h4>

          {isLogementLoading ? (
            <LoadingCard 
              title="Informations de relève du logement" 
              rows={1} 
              columns={[2]} 
              showTitle={false}
            />
          ) : (
            <div className="space-y-6">
              {/* First row - 2 columns: Logement */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                  <p className="mb-2 text-2xl  leading-normal text-gray-500 dark:text-gray-400">
                    Mode de relève:
                  </p>
                  <p className="text-2xl font-semibold text-green-800 dark:text-white/90">
                    {logementInfo.hasTelereleve ? "Réseau fixe TSS" : "Relève planifiée (radio ou manuelle)"}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                  <p className="mb-2 text-2xl  leading-normal text-gray-500 dark:text-gray-400">
                    Transfert électronique de relevés:
                  </p>
                  <p className="text-2xl font-semibold text-green-800 dark:text-white/90">
                    {logementInfo.hasTelereleve ? "Actif" : "Inactif"}
                  </p>  
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
