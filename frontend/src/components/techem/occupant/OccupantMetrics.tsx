"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import StatusIconsAlerte from '@/components/techem/images/StatusIconsAlerte';
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsDysfonctionnement from '@/components/techem/images/StatusIconsDysfonctionnement';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import { LoadingMetrics } from "@/components/ui/loading";
import { OccupantLogementResponse } from "@/lib/hooks/useOccupant";

/**
 * Component displaying 4 logement metrics side by side:
 * - Fuites (nbFuites)
 * - Alarmes (nbDysfonctionnements)
 * - Anomalies (nbAnomalies)
 * - Depannages (nbDepannages)
 */
export const OccupantMetrics = ({ occupantData }: { occupantData: OccupantLogementResponse }) => {
  // Extract pkLogement and pkImmeuble from occupantData
  const pkLogement = occupantData?.logement?.Logement?.PkLogement ?? occupantData?.logement?.logement?.pkLogement ?? "";
  const pkImmeuble = occupantData?.logement?.Immeuble?.PkImmeuble ?? occupantData?.logement?.immeuble?.pkImmeuble ?? "";

  // Extract metrics from API response
  const metrics = useMemo(() => {
    const logement = occupantData?.logement;
    
    return {
      fuites: (logement?.LogementEF?.NbFuites ?? logement?.logementEF?.nbFuites ?? logement?.NbFuites ?? logement?.nbFuites ?? 0) as number,
      alarmes: (logement?.NbDysfonctionnements ?? logement?.nbDysfonctionnements ?? 0) as number,
      anomalies: (logement?.LogementEF?.NbAnomalies ?? logement?.logementEF?.nbAnomalies ?? logement?.NbAnomalies ?? logement?.nbAnomalies ?? 0) as number,
      depannages: (logement?.NbDepannages ?? logement?.nbDepannages ?? 0) as number,
    };
  }, [occupantData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (!occupantData?.logement) {
    return <LoadingMetrics count={4} />;
  }

  // Determine icon colors based on values
  const fuitesColor = metrics.fuites > 0 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
  const dysfonctionnementsColor = metrics.alarmes > 0 ? "text-orange-500 dark:text-orange-400" : "text-gray-400 dark:text-gray-500";
  const anomaliesColor = metrics.anomalies > 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500";
  const depannagesColor = metrics.depannages > 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500";

  return (
    <>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {/* Fuites - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/fuites?fluide=EF`} className="h-full">
          <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Fuites
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(Math.max(metrics.fuites, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
          </div>

          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Fuites
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumber(Math.max(metrics.fuites, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Fuites - Metric Item End */}

      {/* Alarmes (Dysfonctionnements) - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/dysfonctionnements`} className="h-full">
          <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsDysfonctionnement size={24} className={dysfonctionnementsColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Alarmes techniques
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(Math.max(metrics.alarmes, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <StatusIconsDysfonctionnement size={24} className={dysfonctionnementsColor} color="currentColor" />
          </div>
          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Alarmes techniques
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumber(Math.max(metrics.alarmes, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Alarmes - Metric Item End */}

      {/* Anomalies - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/anomalies`} className="h-full">
          <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Anomalies de consommation
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(Math.max(metrics.anomalies, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
          </div>

          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Anomalies de consommation
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumber(Math.max(metrics.anomalies, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Anomalies - Metric Item End */}

      {/* Depannages - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/interventions?statut=ouvert`} className="h-full">
          <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsAlerte size={24} className={depannagesColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Depannages en cours
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(Math.max(metrics.depannages, 0))}
                </h4>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <StatusIconsAlerte size={24} className={depannagesColor} color="currentColor" />
          </div>
          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Depannages en cours
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumber(Math.max(metrics.depannages, 0))}
              </h4>
            </div>
          </div>
        </div>
      )}
      {/* Depannages - Metric Item End */}
    </div>
    </div>
    </>
  );
};

