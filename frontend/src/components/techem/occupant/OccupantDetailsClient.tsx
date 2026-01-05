"use client";
import { useState } from "react";
import LogementReleves, { TabType } from "@/components/techem/logement/LogementReleves";
import LogementConsommationChartEf from "@/components/techem/logement/releve/LogementConsommationChartEf";
import LogementStatisticsConsommationChartEc from "@/components/techem/logement/releve/LogementStatisticsConsommationChartEc";
import LogementConsommationChartEc from "@/components/techem/logement/releve/LogementConsommationChartEc";
import LogementConsommationChartRepart from "@/components/techem/logement/releve/LogementConsommationChartRepart";
import LogementStatisticsConsommationChartRepart from "@/components/techem/logement/releve/LogementStatisticsConsommationChartRepart";
import LogementConsommationChartCet from "@/components/techem/logement/releve/LogementConsommationChartCet";
import LogementStatisticsConsommationChartCet from "@/components/techem/logement/releve/LogementStatisticsConsommationChartCet";
import LogementStatisticsConsommationChartEfAppareil from "@/components/techem/occupant/LogementStatisticsConsommationChartEfAppareil";
import { OccupantLogementResponse } from "@/lib/hooks/useOccupant";

export default function OccupantDetailsClient({ occupantData }: { occupantData: OccupantLogementResponse }) {
  const [selectedTab, setSelectedTab] = useState<TabType>("eauFroide");

  const logement = occupantData?.logement as unknown as {
    Logement?: { PkLogement?: string | number };
    logement?: { pkLogement?: string | number };
    LogementEF?: {
      ListeInfosAppareils?: {
        infosAppareilEAU?: Array<{
          Appareil?: { Numero?: string | number; Emplacement?: string };
          SerieConsos?: { ValeursXYL?: string };
        }>;
      };
      listeInfosAppareils?: {
        infosAppareilEAU?: Array<{
          Appareil?: { Numero?: string | number; Emplacement?: string };
          SerieConsos?: { ValeursXYL?: string };
        }>;
      };
    };
  };

  // Extract pkLogement from occupantData
  const pkLogement =
    logement?.Logement?.PkLogement ?? logement?.logement?.pkLogement ?? "";

  // Extract Eau froide appareils for occupant (ListeInfosAppareils.infosAppareilEAU)
  const efInfosAppareilEAU =
    logement?.LogementEF?.ListeInfosAppareils?.infosAppareilEAU ??
    logement?.LogementEF?.listeInfosAppareils?.infosAppareilEAU ??
    [];

  if (!pkLogement) {
    return null;
  }

  return (
    <div className="col-span-12 space-y-6 xl:col-span-12">
      <LogementReleves 
        pkLogement={String(pkLogement)} 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      {/* Eau froide - Afficher uniquement les composants Ef */}
      {selectedTab === "eauFroide" && (
        <>
          <LogementConsommationChartEf pkLogement={String(pkLogement)} />
          {Array.isArray(efInfosAppareilEAU) &&
            efInfosAppareilEAU.map(
              (
                appareil: {
                  Appareil?: { Numero?: string | number; Emplacement?: string };
                  SerieConsos?: { ValeursXYL?: string };
                },
                index: number,
              ) => {
                const numero =
                  appareil?.Appareil?.Numero ?? `Compteur ${index + 1}`;
                const emplacement = appareil?.Appareil?.Emplacement ?? "";
                const valeursXYL = appareil?.SerieConsos?.ValeursXYL ?? "";

                return (
                  <LogementStatisticsConsommationChartEfAppareil
                    key={numero || index}
                    numero={String(numero)}
                    emplacement={String(emplacement)}
                    valeursXYL={String(valeursXYL ?? "")}
                  />
                );
              },
            )}
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
          <LogementConsommationChartEc pkLogement={String(pkLogement)} />
          <LogementStatisticsConsommationChartEc pkLogement={String(pkLogement)} />
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
          <LogementConsommationChartRepart pkLogement={String(pkLogement)} />
          <LogementStatisticsConsommationChartRepart pkLogement={String(pkLogement)} />
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
          <LogementConsommationChartCet pkLogement={String(pkLogement)} />
          <LogementStatisticsConsommationChartCet pkLogement={String(pkLogement)} />
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

