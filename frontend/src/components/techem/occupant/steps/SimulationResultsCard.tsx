"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./style/SimulationResultsCard.module.css";
import Toggle from "../ui/Toggle";
import { useSimulation } from "./SimulationContext";

export const SimulationResultsCard = () => {
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("simulateur-conso-reelle");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        weeklyLiters?: number;
        monthlyLiters?: number;
      };
      if (typeof parsed.weeklyLiters === "number") {
        setRealWeeklyLiters(parsed.weeklyLiters);
      }
      if (typeof parsed.monthlyLiters === "number") {
        setRealMonthlyLiters(parsed.monthlyLiters);
      }
    } catch {
      // silencieux
    }
  }, []);

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
  const estimatedWeeklyLiters = useMemo(
    () => Object.values(weeklyData).reduce((a, b) => a + b, 0),
    [weeklyData],
  );
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
  const percentages = useMemo(() => {
    if (total <= 0) {
      return [] as { label: string; value: number; pct: number }[];
    }
    return Object.entries(scaledData).map(([label, value]) => ({
      label,
      value,
      pct: +((value / total) * 100).toFixed(1),
    }));
  }, [scaledData, total]);

  // Gestion du tooltip
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    label: "",
    value: "",
  });

  const showTooltip = (e: React.MouseEvent<SVGCircleElement>, label: string, value: string) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      label,
      value,
    });
  };

  const moveTooltip = (e: React.MouseEvent<SVGCircleElement>) => {
    if (!tooltip.visible) return;
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({
      ...t,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }));
  };

  const hideTooltip = () =>
    setTooltip((t) => ({
      ...t,
      visible: false,
    }));

  // Tap mobile
  const toggleTooltipTap = (e: React.MouseEvent<SVGCircleElement>, label: string, value: string) => {
    e.preventDefault();
    if (tooltip.visible && tooltip.label === label) {
      hideTooltip();
      return;
    }
    showTooltip(e, label, value);
  };

  // Mapping des couleurs (proche de ton design chantier, mais version water)
  const colors = [
    ["#008DFF", "#006BCE"],
    ["#6EC8FF", "#A5E0FF"],
    ["#00C2A0", "#00A784"],
    ["#FFC65C", "#FFB020"],
    ["#FF7A7A", "#FF5252"],
  ];

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
        <svg
          width="200"
          height="200"
          viewBox="0 0 42 42"
          className={styles.donut}
          role="img"
        >
          <defs>
            {colors.map((c, i) => (
              <linearGradient
                key={i}
                id={`grad-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={c[0]} />
                <stop offset="100%" stopColor={c[1]} />
              </linearGradient>
            ))}
          </defs>

          {percentages.map((item, i) => {
            const prev = percentages
              .slice(0, i)
              .reduce((acc, s) => acc + s.pct, 0);

            return (
              <circle
                key={i}
                className={styles.segment}
                stroke={`url(#grad-${i})`}
                strokeDasharray={`${item.pct} ${100 - item.pct}`}
                strokeDashoffset={-prev}
                cx="21"
                cy="21"
                r="15.915"
                tabIndex={0}
                aria-label={`${item.label} ${item.pct}%`}
                onMouseEnter={(e) =>
                  showTooltip(
                    e,
                    item.label,
                    `${Math.round(item.value)} L (${item.pct}%)`,
                  )
                }
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
                onClick={(e) =>
                  toggleTooltipTap(
                    e,
                    item.label,
                    `${Math.round(item.value)} L (${item.pct}%)`,
                  )
                }
              />
            );
          })}

          {tooltip.visible && (
            <foreignObject
              x={Math.max(tooltip.x - 30, 0)}
              y={Math.max(tooltip.y - 36, 0)}
              width="80"
              height="40"
            >
              <div className={styles.tooltip}>
                <div className={styles.tooltipTitle}>{tooltip.label}</div>
                <div className={styles.tooltipValue}>{tooltip.value}</div>
              </div>
            </foreignObject>
          )}
        </svg>

        {/* Légende */}
        {percentages.length > 0 && (
          <div className={styles.legend}>
            {percentages.map((item, i) => (
              <div key={i} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: colors[i % colors.length][1] }}
                ></span>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};