"use client";
import { useState, lazy } from "react";
import LogementReleves, { TabType } from "@/components/techem/logement/LogementReleves";
import LogementConsommationChartEf from "@/components/techem/logement/releve/LogementConsommationChartEf";
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
}

export default function LogementDetailsClient({ pkLogement }: LogementDetailsClientProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>("eauFroide");

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

