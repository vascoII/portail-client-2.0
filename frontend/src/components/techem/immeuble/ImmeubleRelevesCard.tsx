"use client";
import React, { useMemo } from "react";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingCard } from "@/components/ui/loading";

interface ImmeubleRelevesCardProps {
  pkImmeuble: string;
}

export default function ImmeubleRelevesCard({ pkImmeuble }: ImmeubleRelevesCardProps) {
  const { getImmeubleQuery } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = getImmeubleQuery(pkImmeuble);

  // Extract immeuble information from API response
  const immeubleInfo = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    return {
      hasTelereleve: (immeuble?.HasTelereleve ?? immeuble?.HasTelereleve ?? false) as boolean,
    };
  }, [immeubleData]);


  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations de relève de l&apos;immeuble 
          </h4>

          {isImmeubleLoading ? (
            <LoadingCard 
              title="Informations de relève de l'immeuble" 
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
                    {immeubleInfo.hasTelereleve ? "Réseau fixe TSS" : "Relève planifiée (radio ou manuelle)"}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                  <p className="mb-2 text-2xl  leading-normal text-gray-500 dark:text-gray-400">
                    Transfert électronique de relevés:
                  </p>
                  <p className="text-2xl font-semibold text-green-800 dark:text-white/90">
                    {immeubleInfo.hasTelereleve ? "Actif" : "Inactif"}
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
