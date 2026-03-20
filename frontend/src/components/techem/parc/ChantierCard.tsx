"use client";

import React, { useMemo, useState } from "react";
import { useParc } from "@/lib/hooks/useParc";
import styles from "./style/ChantierCard.module.css"; 
import { LoadingCard } from "@/components/ui/loading";

export const ChantierDashboardCard = () => {
  const { parcData, isParcLoading } = useParc();
  
  // Extract parc information from API response
  const chantierInfo = useMemo(() => {
    const chantier = parcData?.chantier;
    return {
      installed: (chantier?.installed ?? chantier?.installed ?? 0) as number,
      installed_percent: (chantier?.installed_percent ?? chantier?.installed_percent ?? 0) as number,
      remaining: (chantier?.remaining ?? chantier?.remaining ?? 0) as number,
      remaining_percent: (chantier?.remaining_percent ?? chantier?.remaining_percent ?? 0) as number,
      total: (chantier?.total ?? chantier?.total ?? 0) as number,
      date: (chantier?.date ?? chantier?.date ?? null) as string,
    };
  }, [parcData]);

  // --- Données inchangées (comme demandé) ---
  const poses = chantierInfo.installed ?? 123;
  const aPoser = chantierInfo.remaining ?? 234;
  const commandes = chantierInfo.total ?? 357;

  // Calcul des pourcentages pour le donut
  const { pctPoses, pctAPoser } = useMemo(() => {
    const pctPoses = +( (poses / commandes) * 100 ).toFixed(1);
    const pctAPoser = +( (aPoser / commandes) * 100 ).toFixed(1);
    return { pctPoses, pctAPoser };
  }, [poses, aPoser, commandes]);

  // --- Tooltip state ---
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    value: string;
  }>({ visible: false, x: 0, y: 0, label: "", value: "" });

  const showTooltip = (e: React.MouseEvent<SVGCircleElement>, label: string, value: string) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    // Position du pointeur relative au SVG
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ visible: true, x, y, label, value });
  };

  const moveTooltip = (e: React.MouseEvent<SVGCircleElement>) => {
    if (!tooltip.visible) return;
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    setTooltip((t) => ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };

  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  // Tap mobile : toggle sur segment
  const toggleTooltipTap = (
    e: React.MouseEvent<SVGCircleElement>,
    label: string,
    value: string
  ) => {
    e.preventDefault();
    if (tooltip.visible && tooltip.label === label) {
      hideTooltip();
      return;
    }
    showTooltip(e, label, value);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>🏗️ Chantiers en cours</h2>
      {isParcLoading ? (
        <LoadingCard 
          title="Informations des chantier" 
          rows={1} 
          columns={[2]} 
          showTitle={false}
        />
      ) : (
        <>
          {/* TABLE */}
          <table className={styles.table}>
            <tbody>
              <tr>
                <td>Appareils posés</td>
                <td className={styles.value}>{ poses }</td>
              </tr>
              <tr>
                <td>Appareils à poser</td>
                <td className={styles.value}>{ aPoser }</td>
              </tr>
              <tr>
                <td>Appareils commandés</td>
                <td className={styles.value}>{ commandes }</td>
              </tr>
            </tbody>
          </table>

          {/* DONUT + TOOLTIP */}
          <div className={styles.donutWrapper}>
            <svg
              width="200"
              height="200"
              viewBox="0 0 42 42"
              className={styles.donut}
              role="img"
              aria-label="Répartition posés / à poser"
            >
              <defs>
                <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#74bdf7" />
                  <stop offset="100%" stopColor="#007bcb" />
                </linearGradient>
                <linearGradient id="gradB" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d1ecff" />
                  <stop offset="100%" stopColor="#7cc8f8" />
                </linearGradient>
              </defs>

              {/* Segment 1 : POSÉS */}
              <circle
                className={styles.segment}
                stroke="url(#gradA)"
                strokeDasharray={`${pctPoses} ${100 - pctPoses}`}
                cx="21"
                cy="21"
                r="15.915"
                tabIndex={0}
                aria-label={`Appareils posés ${pctPoses}%`}
                onMouseEnter={(e) => showTooltip(e, "Appareils posés", `${pctPoses}%`)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
                onClick={(e) => toggleTooltipTap(e, "Appareils posés", `${pctPoses}%`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    // Simule le tap clavier
                    toggleTooltipTap(e as any, "Appareils posés", `${pctPoses}%`); // eslint-disable-line @typescript-eslint/no-explicit-any
                  }
                }}
              />

              {/* Segment 2 : À POSER */}
              <circle
                className={styles.segment}
                stroke="url(#gradB)"
                strokeDasharray={`${pctAPoser} ${100 - pctAPoser}`}
                cx="21"
                cy="21"
                r="15.915"
                transform="rotate(95 21 21)" /* petit décalage comme ton design */
                tabIndex={0}
                aria-label={`Appareils à poser ${pctAPoser}%`}
                onMouseEnter={(e) => showTooltip(e, "Appareils à poser", `${pctAPoser}%`)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
                onClick={(e) => toggleTooltipTap(e, "Appareils à poser", `${pctAPoser}%`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    toggleTooltipTap(e as any, "Appareils à poser", `${pctAPoser}%`);// eslint-disable-line @typescript-eslint/no-explicit-any
                  }
                }}
              />

              {/* Tooltip overlay interne au SVG (positionné avec <foreignObject>) */}
              {tooltip.visible && (
                <foreignObject
                  x={Math.max(tooltip.x - 30, 0)}
                  y={Math.max(tooltip.y - 36, 0)}
                  width="80"
                  height="40"
                >
                  <div className={styles.tooltip} >
                    <div className={styles.tooltipTitle}>{tooltip.label}</div>
                    <div className={styles.tooltipValue}>{tooltip.value}</div>
                  </div>
                </foreignObject>
              )}
            </svg>

            {/* Légende (inchangée) */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.dotBlue}></span> Appareils posés
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dotLight}></span> Appareils à poser
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};