"use client";

import React, { useMemo, useState } from "react";
import styles from "./style/SimulationResultsCard.module.css";

export const SimulationResultsCard = ({ data }: { data: Record<string, number> }) => {
  /**
   * data = {
   *   douches: 120,
   *   wc: 30,
   *   linge: 15,
   *   vaisselle: 10,
   *   jardin: 25
   * }
   */

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  // Calculs pour les segments du donut
  const percentages = useMemo(() => {
    return Object.entries(data).map(([label, value]) => ({
      label,
      value,
      pct: +((value / total) * 100).toFixed(1),
    }));
  }, [data, total]);

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

      {/* Total */}
      <div className={styles.total}>
        <span>Total estimé :</span>
        <strong>{total} L / jour</strong>
      </div>

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
                  showTooltip(e, item.label, `${item.pct}%`)
                }
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
                onClick={(e) =>
                  toggleTooltipTap(e, item.label, `${item.pct}%`)
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
        <div className={styles.legend}>
          {percentages.map((item, i) => (
            <div key={i} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: colors[i][1] }}
              ></span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};