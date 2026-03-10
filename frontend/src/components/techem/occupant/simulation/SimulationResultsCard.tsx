"use client";

import React, { useMemo, useState } from "react";
import styles from "./style/SimulationResultsCard.module.css";
import Toggle from "../ui/Toggle";
import DonutChart from "../ui/DonutChart";
import { useSimulation } from "./SimulationContext";

export default function SimulationResultsCard() {  
  const { state, update } = useSimulation();

  const {
    occupants,
    showersPerOccupantPerWeek,
    bathsPerOccupantPerWeek,
    flushesPerOccupantPerWeek,
    toiletType,
    dishwasherEnabled,
    dishwasherPerf,
    dishwasherCyclesPerWeek,
    washingEnabled,
    washingPerf,
    washingCyclesPerWeek,
    gardenEnabled,
    gardenSizeM2,
    isMonthly,
  } = state;

  const [realWeeklyLiters, setRealWeeklyLiters] = useState<number | null>(null);
  const [realMonthlyLiters, setRealMonthlyLiters] = useState<number | null>(null);

  // Lecture de la consommation réelle calculée sur la page occupant
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      const user = authData?.state?.user;
    
      if (user?.PKUser) {
        const occupantConsumption = localStorage.getItem("occupant_consumption_" + user?.PKUser);
        if (occupantConsumption) {
          const occupantConsumptionData = JSON.parse(occupantConsumption);   

          if (typeof occupantConsumptionData.weeklyLiters === "number") {
            setRealWeeklyLiters(occupantConsumptionData.weeklyLiters);
          }
          if (typeof occupantConsumptionData.monthlyLiters === "number") {
            setRealMonthlyLiters(occupantConsumptionData.monthlyLiters);
          }
        }        
      }
    }  
  } catch (e){
    console.log("error: " + e)
  }

  // Reprise de la logique de calcul de simulateur.html.twig
  const weeklyData = useMemo(() => {
    const showerUse = occupants * showersPerOccupantPerWeek * 50;
    const bathUse = occupants * bathsPerOccupantPerWeek * 150;
    const toiletUse =
      occupants *
      flushesPerOccupantPerWeek *
      (toiletType === "eco" ? 5 : 10);
    const dishwasherUse = dishwasherEnabled
      ? dishwasherCyclesPerWeek * (dishwasherPerf === "low" ? 10 : 15)
      : 0;
    const washingUse = washingEnabled
      ? washingCyclesPerWeek * (washingPerf === "low" ? 50 : 70)
      : 0;
    const gardenUse = gardenEnabled ? gardenSizeM2 * 6 : 0;

    return {
      "Douches": showerUse,
      "Bains": bathUse,
      "Chasses d'eau": toiletUse,
      "Lave-vaisselle": dishwasherUse,
      "Lave-linge": washingUse,
      "Jardin": gardenUse,
    };
  }, [
    occupants,
    showersPerOccupantPerWeek,
    bathsPerOccupantPerWeek,
    flushesPerOccupantPerWeek,
    toiletType,
    dishwasherEnabled,
    dishwasherPerf,
    dishwasherCyclesPerWeek,
    washingEnabled,
    washingPerf,
    washingCyclesPerWeek,
    gardenEnabled,
    gardenSizeM2,
  ]);

  const scaledData = useMemo(() => {
    if (!isMonthly) {
      return weeklyData;
    }
    const monthly: Record<string, number> = {};
    Object.entries(weeklyData).forEach(([key, value]) => {
      monthly[key] = value * 4;
    });
    return monthly;
  }, [weeklyData, isMonthly]);

  const total = Object.values(scaledData).reduce((a, b) => a + b, 0);

  // Totaux hebdo / mensuels pour la simulation (pour comparaison chiffrée)
  let estimatedWeeklyLiters = useMemo(
    () => Object.values(weeklyData).reduce((a, b) => a + b, 0),
    [weeklyData],
  );

  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
      const authData = JSON.parse(authStorage);
      const user = authData?.state?.user;

      if (user?.PKUser) {
        const occupantConsumption = localStorage.getItem("occupant_consumption_" + user?.PKUser);
        if (occupantConsumption) {
          const occupantConsumptionData = JSON.parse(occupantConsumption);   
          estimatedWeeklyLiters = occupantConsumptionData?.weeklyLiters 
        }        
      } 
  } 

  const estimatedMonthlyLiters = estimatedWeeklyLiters * 4;

  const comparisonEstimated = isMonthly ? estimatedMonthlyLiters : estimatedWeeklyLiters;
  const comparisonReal =
    isMonthly ? realMonthlyLiters ?? null : realWeeklyLiters ?? null;

  const diffLiters =
    comparisonReal !== null ? comparisonEstimated - comparisonReal : null;
  const diffPercent =
    diffLiters !== null && comparisonReal && comparisonReal > 0
      ? (diffLiters / comparisonReal) * 100
      : null;

  const diffClass =
    diffLiters !== null && comparisonReal !== null
      ? diffLiters > 0
        ? "text-red-600"
        : diffLiters < 0
          ? "text-emerald-600"
          : "text-gray-700"
      : "text-gray-400";

  // Calculs pour les segments du donut
  /**const percentages = useMemo(() => {
    if (total <= 0) {
      return [] as { label: string; value: number; pct: number }[];
    }
    return Object.entries(scaledData).map(([label, value]) => ({
      label,
      value,
      pct: +((value / total) * 100).toFixed(1),
    }));
  }, [scaledData, total]);*/

  // Gestion du tooltip
  /**const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    label: "",
    value: "",
  });*/

  /**const showTooltip = (e: React.MouseEvent<SVGCircleElement>, label: string, value: string) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      label,
      value,
    });
  };*/

  /**const moveTooltip = (e: React.MouseEvent<SVGCircleElement>) => {
    if (!tooltip.visible) return;
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({
      ...t,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }));
  };*/

  /**const hideTooltip = () =>
    setTooltip((t) => ({
      ...t,
      visible: false,
    }));*/

  // Tap mobile
  /**const toggleTooltipTap = (e: React.MouseEvent<SVGCircleElement>, label: string, value: string) => {
    e.preventDefault();
    if (tooltip.visible && tooltip.label === label) {
      hideTooltip();
      return;
    }
    showTooltip(e, label, value);
  };*/

  // Mapping des couleurs (proche de design chantier, mais version water)
  /**const colors = [
    ["#008DFF", "#006BCE"],
    ["#6EC8FF", "#A5E0FF"],
    ["#00C2A0", "#00A784"],
    ["#FFC65C", "#FFB020"],
    ["#FF7A7A", "#FF5252"],
  ];*/

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>💧 Répartition de votre consommation</h2>

      <div className="mb-4">
        <Toggle
          label="Afficher les résultats en valeurs mensuelles"
          value={isMonthly}
          onChange={(value) => update({ isMonthly: value })}
        />
      </div>

      {total <= 0 && (
        <div className="text-sm text-gray-500 mb-3">
          Renseignez les informations des étapes précédentes pour afficher une
          estimation de votre consommation.
        </div>
      )}

      {/* Total */}
      <div className={styles.total}>
        <span>Total estimé :</span>
        <strong>
          {Math.round(total)} L / {isMonthly ? "mois" : "semaine"}
        </strong>
      </div>
      {comparisonReal !== null && (
        <div className="mt-3 space-y-1 text-xs text-gray-700">
          <div className="flex flex-wrap items-baseline gap-3">
            <div>
              <span className="text-gray-500">Estimation :</span>{" "}
              <span className="font-semibold">
                {Math.round(comparisonEstimated)} L /{" "}
                {isMonthly ? "mois" : "semaine"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Réel :</span>{" "}
              <span className="font-semibold">
                {Math.round(comparisonReal)} L /{" "}
                {isMonthly ? "mois" : "semaine"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Écart :</span>{" "}
              <span className={`font-semibold ${diffClass}`}>
                {diffLiters !== null
                  ? `${diffLiters > 0 ? "+" : ""}${Math.round(diffLiters)} L`
                  : "N/A"}
                {diffPercent !== null && (
                  <> ({diffPercent > 0 ? "+" : ""}{diffPercent.toFixed(1)}%)</>
                )}
              </span>
            </div>
          </div>

          {/* Mini-barres de comparaison */}
          <div className="mt-2 space-y-1">
            {(() => {
              const maxVal = Math.max(comparisonEstimated, comparisonReal || 0);
              const safeMax = maxVal > 0 ? maxVal : 1;
              const estWidth = Math.max(
                8,
                Math.round((comparisonEstimated / safeMax) * 100),
              );
              const realWidth = Math.max(
                8,
                Math.round(((comparisonReal || 0) / safeMax) * 100),
              );
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-gray-500">
                      Estimé
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${estWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-gray-500">
                      Réel
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${realWidth}%` }}
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className={styles.donutWrapper}>
        <DonutChart data={scaledData} />
      </div>
    </div>
  );
};