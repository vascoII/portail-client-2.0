"use client";
import { useState, lazy, useMemo } from "react";
import LogementReleves, { TabType } from "@/components/techem/logement/LogementReleves";
import { LogementMetricsEau } from "@/components/techem/logement/LogementMetricsEau";
import LogementConsommationChartEf from "@/components/techem/logement/releve/LogementConsommationChartEf";
import { useLogements } from "@/lib/hooks/useLogements";
import LogementStatisticsConsommationChartEf from "@/components/techem/logement/releve/LogementStatisticsConsommationChartEf";
import LogementConsommationChartEc from "@/components/techem/logement/releve/LogementConsommationChartEc";
import LogementStatisticsConsommationChartEc from "@/components/techem/logement/releve/LogementStatisticsConsommationChartEc";
import LogementConsommationChartRepart from "@/components/techem/logement/releve/LogementConsommationChartRepart";
import LogementStatisticsConsommationChartRepart from "@/components/techem/logement/releve/LogementStatisticsConsommationChartRepart";
import LogementConsommationChartCet from "@/components/techem/logement/releve/LogementConsommationChartCet";
import LogementStatisticsConsommationChartCet from "@/components/techem/logement/releve/LogementStatisticsConsommationChartCet";

// Lazy load des composants lourds
const LogementStatisticsConsommationChartConsoTabsEf = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartConsoTabsEf")
);
const LogementStatisticsConsommationChartSerieConsosEf = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartSerieConsosEf")
);
const LogementStatisticsConsommationChartConsoTabsEc = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartConsoTabsEc")
);
const LogementStatisticsConsommationChartSerieConsosEc = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartSerieConsosEc")
);
const LogementStatisticsConsommationChartConsoTabsRepart = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartConsoTabsRepart")
);
const LogementStatisticsConsommationChartSerieConsosRepart = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartSerieConsosRepart")
);
const LogementStatisticsConsommationChartConsoTabsCet = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartConsoTabsCet")
);
const LogementStatisticsConsommationChartSerieConsosCet = lazy( // eslint-disable-line @typescript-eslint/no-unused-vars
  () => import("@/components/techem/logement/releve/LogementStatisticsConsommationChartSerieConsosCet")
);

interface LogementDetailsClientProps {
  pkLogement: string;
  pkImmeuble: string;
}

export default function LogementDetailsClient({ pkLogement, pkImmeuble }: LogementDetailsClientProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>("eauFroide");
  const { useLogementQuery } = useLogements();
  const { data: logementData } = useLogementQuery(pkLogement);

  // Extract metrics for Eau Froide (EF) and Eau Chaude (EC)
  const metricsEf = useMemo(() => {
    const logementEF = logementData?.logement?.LogementEF ?? logementData?.logement?.logementEF;
    return {
      nbFuites: (logementEF?.NbFuites ?? logementEF?.nbFuites ?? 0) as number,
      nbAnomalies: (logementEF?.NbAnomalies ?? logementEF?.nbAnomalies ?? 0) as number,
    };
  }, [logementData]);

  const metricsEc = useMemo(() => {
    const logementEC = logementData?.logement?.LogementEC ?? logementData?.logement?.logementEC;
    return {
      nbFuites: (logementEC?.NbFuites ?? logementEC?.nbFuites ?? 0) as number,
      nbAnomalies: (logementEC?.NbAnomalies ?? logementEC?.nbAnomalies ?? 0) as number,
    };
  }, [logementData]);

  return (
    <div className="col-span-12 space-y-6 xl:col-span-12">
      <LogementReleves 
        pkLogement={pkLogement} 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      {/* Eau froide - Afficher uniquement les composants Ef */}
      {selectedTab === "eauFroide" && (
        <>
          <LogementMetricsEau 
            pkLogement={pkLogement} 
            pkImmeuble={pkImmeuble}
            nbFuites={metricsEf.nbFuites}
            nbAnomalies={metricsEf.nbAnomalies}
          />
          <LogementConsommationChartEf pkLogement={pkLogement} />
          <LogementStatisticsConsommationChartEf pkLogement={pkLogement} />
{/*          
          <Accordion title="Évolution des consommations (ConsoTabs)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartConsoTabsEf pkLogement={pkLogement} />
            </Suspense>
          </Accordion>

          <Accordion title="Évolution des consommations (Série)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartSerieConsosEf pkLogement={pkLogement} />
            </Suspense>
          </Accordion>*/}
        </>
      )}
      
      {/* Eau chaude - Afficher uniquement les composants Ec */}
      {selectedTab === "eauChaude" && (
        <>
          <LogementMetricsEau 
            pkLogement={pkLogement} 
            pkImmeuble={pkImmeuble}
            nbFuites={metricsEc.nbFuites}
            nbAnomalies={metricsEc.nbAnomalies}
          />
          <LogementConsommationChartEc pkLogement={pkLogement} />
          <LogementStatisticsConsommationChartEc pkLogement={pkLogement} />
  {/*        
          <Accordion title="Évolution des consommations (ConsoTabs)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartConsoTabsEc pkLogement={pkLogement} />
            </Suspense>
          </Accordion>

          <Accordion title="Évolution des consommations (Série)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartSerieConsosEc pkLogement={pkLogement} />
            </Suspense>
          </Accordion>*/}
        </>
      )}
      
      {/* Répartiteur - Afficher uniquement les composants Repart */}
      {selectedTab === "repartiteur" && (
        <>
          <LogementConsommationChartRepart pkLogement={pkLogement} />
          <LogementStatisticsConsommationChartRepart pkLogement={pkLogement} />
  {/*        
          <Accordion title="Évolution des consommations (ConsoTabs)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartConsoTabsRepart pkLogement={pkLogement} />
            </Suspense>
          </Accordion>

          <Accordion title="Évolution des consommations (Série)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartSerieConsosRepart pkLogement={pkLogement} />
            </Suspense>
          </Accordion>*/}
        </>
      )}
      
      {/* Compteur d'énergie - Afficher uniquement les composants Cet */}
      {selectedTab === "compteurEnergie" && (
        <>
          <LogementConsommationChartCet pkLogement={pkLogement} />
          <LogementStatisticsConsommationChartCet pkLogement={pkLogement} />
  {/*        
          <Accordion title="Évolution des consommations (ConsoTabs)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartConsoTabsCet pkLogement={pkLogement} />
            </Suspense>
          </Accordion>

          <Accordion title="Évolution des consommations (Série)">
            <Suspense
              fallback={
                <LoadingChart
                  variant="line"
                  height={310}
                  title="Évolution des consommations"
                  message="Chargement..."
                />
              }
            >
              <LogementStatisticsConsommationChartSerieConsosCet pkLogement={pkLogement} />
            </Suspense>
          </Accordion>*/}
        </>
      )}
    </div>
  );
}

