"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingCard } from "@/components/ui/loading";

interface ImmeubleMainCardProps {
  pkImmeuble: string;
}

export default function ImmeubleMainCard({ pkImmeuble }: ImmeubleMainCardProps) {
  const { useImmeubleQuery } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = useImmeubleQuery(pkImmeuble);

  // Extract immeuble information from API response
  const immeubleInfo = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    return {
      nbLogements: (immeuble?.NbLogements ?? immeuble?.nbLogements ?? 0) as number,
      nbCompteurs: (immeuble?.NbAppareils ?? immeuble?.nbAppareils ?? 0) as number,
      nbCompteursEf: (immeuble?.NbCompteursEF ?? immeuble?.nbCompteursEF ?? immeuble?.NbCompteursEf ?? immeuble?.nbCompteursEf ?? 0) as number,
      nbCompteursEc: (immeuble?.NbCompteursEC ?? immeuble?.nbCompteursEC ?? immeuble?.NbCompteursEc ?? immeuble?.nbCompteursEc ?? 0) as number,
      nbCompteursRepart: (immeuble?.NbCompteursRepart ?? immeuble?.nbCompteursRepart ?? 0) as number,
      nbCompteursCet: (immeuble?.NbCompteursCET ?? immeuble?.nbCompteursCET ?? immeuble?.NbCompteursCet ?? immeuble?.nbCompteursCet ?? 0) as number,
    };
  }, [immeubleData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <div className="p-5 border border-[#1d1914] rounded-xl shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-xl font-normal text-[#1d1914] lg:mb-6">
            Informations de l&apos;immeuble 
          </h4>

          {isImmeubleLoading ? (
            <LoadingCard 
              title="Informations de l'immeuble" 
              rows={2} 
              columns={[2, 4]} 
              showTitle={false}
            />
          ) : (
            <div className="space-y-6">
              {/* First row - 2 columns: Logements and Nombre d'Appareils */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <Link href={`/immeuble/${pkImmeuble}/logements`} className="p-4 border border-[#1d1914] rounded-xl bg-[#e9ecef] hover:bg-[#ffe5e6] transition-all duration-300 cursor-pointer">
                  <center>
                    <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                      {formatNumber(immeubleInfo.nbLogements)} Logements
                    </p>
                  </center>
                </Link>

                <div className="p-4 border border-[#1d1914] rounded-xl">
                  <center>
                    <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Nombres d&apos;appareils
                    </p>
                  </center>
                  <center>
                  <p className="text-2xl font-normal text-[#1d1914]">
                    {formatNumber(immeubleInfo.nbCompteurs)}
                </p>  
                  </center>
                </div>
              </div>

              {/* Second row - 4 columns: Eau froide, Eau chaude, Répartiteurs, Compteur d'énergie */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Eau froide
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-normal text-[#1d1914]">
                    {formatNumber(immeubleInfo.nbCompteursEf)}
                  </p>
                  </center>
                </div>

                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Eau chaude
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-normal text-[#1d1914]">
                    {formatNumber(immeubleInfo.nbCompteursEc)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Répartiteurs
                  </p>
                  <p className="text-2xl font-normal text-[#1d1914]">
                    {formatNumber(immeubleInfo.nbCompteursRepart)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-[#1d1914]">
                    Compteur d&apos;énergie
                  </p>
                  <p className="text-2xl font-normal text-[#1d1914]">
                    {formatNumber(immeubleInfo.nbCompteursCet)}
                  </p>
                  </center>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
