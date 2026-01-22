"use client";
import React, { useMemo } from "react";
import { OccupantLogementResponse } from "@/lib/hooks/useOccupant";
import { LoadingCard } from "@/components/ui/loading";

export default function OccupantRelevesCard({ occupantData }: { occupantData: OccupantLogementResponse }) {
  // Extract logement information from API response
  // HasTelereleve is typically at the immeuble level, so we access it via logement.Immeuble
  const logementInfo = useMemo(() => {
    const logement = occupantData?.logement;
    const immeuble = logement?.Immeuble ?? logement?.immeuble;
    return {
      hasTelereleve: (immeuble?.HasTelereleve ?? immeuble?.hasTelereleve ?? false) as boolean,
    };
  }, [occupantData]);


  return (
    <div className="p-5 border border-[#1d1914] rounded-xl shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-xl font-normal text-[#1d1914] lg:mb-6">
            Informations de relève du logement 
          </h4>

          {!occupantData?.logement ? (
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
                <div className="p-4 border border-[#1d1914] rounded-xl">
                  <p className="mb-2 text-2xl leading-normal text-[#1d1914]">
                    Mode de relève:
                  </p>
                  <p className="text-2xl font-normal text-[#417232]">
                    {logementInfo.hasTelereleve ? "Réseau fixe TSS" : "Relève planifiée (radio ou manuelle)"}
                  </p>
                </div>
                <div className="p-4 border border-[#1d1914] rounded-xl">
                  <p className="mb-2 text-2xl leading-normal text-[#1d1914]">
                    Transfert électronique de relevés:
                  </p>
                  <p className="text-2xl font-normal text-[#417232]">
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
