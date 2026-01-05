"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useParc } from "@/lib/hooks/useParc";
import { LoadingCard } from "@/components/ui/loading";

export default function ParcMainCard() {
  const { parcData, isParcLoading } = useParc();

  // Extract parc information from API response
  const parcInfo = useMemo(() => {
    const board = parcData?.board;
    return {
      nbImmeubles: board?.nbImmeubles ?? 0,
      nbCompteurs: board?.nbCompteurs ?? 0,
      nbCompteursEf: board?.nbCompteursEf ?? 0,
      nbCompteursEc: board?.nbCompteursEc ?? 0,
      nbCompteursRepart: board?.nbCompteursRepart ?? 0,
      nbCompteursCet: board?.nbCompteursCet ?? 0,
    };
  }, [parcData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations du parc
          </h4>

          {isParcLoading ? (
            <LoadingCard 
              title="Informations du parc" 
              rows={2} 
              columns={[2, 4]} 
              showTitle={false}
            />
          ) : (
            <div className="space-y-6">
              {/* First row - 2 columns: Immeubles and Nombre d'Appareils */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <Link
                  href="/immeuble"
                  className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                  style={{ backgroundColor: "#f0f0f0" }}
                >
                  <center>
                    <p className="mb-2 text-2xl leading-normal text-gray-500 dark:text-gray-400 flex items-center justify-center gap-3">
                      <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      {formatNumber(parcInfo.nbImmeubles)} Immeubles
                    </p>
                  </center>
                </Link>

                <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                  <center>
                    <p className="mb-2 text-2xl  leading-normal text-gray-500 dark:text-gray-400">
                    Nombres d&apos;appareils
                    </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(parcInfo.nbCompteurs)}
                </p>  
                  </center>
                </div>
              </div>

              {/* Second row - 4 columns: Eau froide, Eau chaude, Répartiteurs, Compteur d'énergie */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Eau froide
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(parcInfo.nbCompteursEf)}
                  </p>
                  </center>
                </div>

                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Eau chaude
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(parcInfo.nbCompteursEc)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Répartiteurs
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(parcInfo.nbCompteursRepart)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Compteur d&apos;énergie
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(parcInfo.nbCompteursCet)}
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
