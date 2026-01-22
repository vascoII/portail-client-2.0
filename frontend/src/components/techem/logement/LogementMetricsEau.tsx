"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useLogements } from "@/lib/hooks/useLogements";
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import { LoadingMetrics } from "@/components/ui/loading";

interface LogementMetricsEauProps {
  pkLogement: string;
  pkImmeuble: string;
  nbFuites?: number;
  nbAnomalies?: number;
}

/**
 * Component displaying 2 logement metrics side by side:
 * - Fuites (nbFuites)
 * - Anomalies (nbAnomalies)
 */
export const LogementMetricsEau = ({ pkLogement, pkImmeuble, nbFuites, nbAnomalies }: LogementMetricsEauProps) => {
  const { useLogementQuery } = useLogements();
  const { data: logementData, isLoading: isLogementLoading } = useLogementQuery(pkLogement);

  // Extract metrics from API response or use provided props
  const metrics = useMemo(() => {
    // Si les valeurs sont fournies en props, les utiliser directement
    if (nbFuites !== undefined && nbAnomalies !== undefined) {
      return {
        fuites: nbFuites,
        anomalies: nbAnomalies,
      };
    }
    
    // Sinon, extraire depuis les données de l'API
    const logement = logementData?.logement;
    
    return {
      fuites: (logement?.NbFuites ?? logement?.nbFuites ?? 0) as number,
      anomalies: (logement?.NbAnomalies ?? logement?.nbAnomalies ?? 0) as number,
    };
  }, [logementData, nbFuites, nbAnomalies]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (isLogementLoading) {
    return <LoadingMetrics count={2} />;
  }

  // Determine icon colors based on values
  const fuitesColor = metrics.fuites > 0 ? "text-[#009bb4]" : "text-[#6a6a6a]";
  const anomaliesColor = metrics.anomalies > 0 ? "text-[#b00511]" : "text-[#6a6a6a]";

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-4 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Fuites - Metric Item Start */}
        <Link href={`/immeuble/${pkImmeuble}/logements/${pkLogement}/fuites`} className="h-full">
          <div className="flex items-center gap-3 h-full rounded-xl border border-[#1d1914] bg-white p-5 hover:bg-[#ffe5e6] transition-all duration-300 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl flex-shrink-0">
              <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
            </div>
            <div className="flex items-center gap-2 flex-grow">
              <span className="text-sm text-[#1d1914]">
                Fuites
              </span>
              <h4 className="font-normal text-[#1d1914] text-xl">
                {formatNumber(Math.max(metrics.fuites, 0))}
              </h4>
            </div>
          </div>
        </Link>
        {/* Fuites - Metric Item End */}

        {/* Anomalies - Metric Item Start */}
        <Link href={`/immeuble/${pkImmeuble}/logements/${pkLogement}/anomalies`} className="h-full">
          <div className="flex items-center gap-3 h-full rounded-xl border border-[#1d1914] bg-white p-5 hover:bg-[#ffe5e6] transition-all duration-300 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl flex-shrink-0">
              <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
            </div>
            <div className="flex items-center gap-2 flex-grow">
              <span className="text-sm text-[#1d1914]">
                Anomalies de consommation
              </span>
              <h4 className="font-normal text-[#1d1914] text-xl">
                {formatNumber(Math.max(metrics.anomalies, 0))}
              </h4>
            </div>
          </div>
        </Link>
        {/* Anomalies - Metric Item End */}
      </div>
    </div>
  );
};

