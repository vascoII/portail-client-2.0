"use client";
import React, { useMemo } from "react";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingCard } from "@/components/ui/loading";

interface ImmeubleRelevesCardProps {
  pkImmeuble: string;
}

export default function ImmeubleRelevesCard({ pkImmeuble }: ImmeubleRelevesCardProps) {
  const { useImmeubleQuery } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = useImmeubleQuery(pkImmeuble);

  // Extract immeuble information from API response
  const immeubleInfo = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    return {
      hasTelereleve: (immeuble?.HasTelereleve ?? immeuble?.HasTelereleve ?? false) as boolean,
    };
  }, [immeubleData]);


  return (
    <div className="p-5 border border-[#1d1914] rounded-xl shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-xl font-normal text-[#1d1914] lg:mb-6">
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
                <div className="p-4 border border-[#1d1914] rounded-xl">
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Mode de relève:
                  </p>
                  <p className="text-xl font-normal text-[#1d1914]">
                    {immeubleInfo.hasTelereleve ? "Réseau fixe TSS" : "Relève planifiée (radio ou manuelle)"}
                  </p>
                </div>
                <div className="p-4 border border-[#1d1914] rounded-xl">
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Transfert électronique de relevés:
                  </p>
                  <p className="text-xl font-normal text-[#417232]">
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
