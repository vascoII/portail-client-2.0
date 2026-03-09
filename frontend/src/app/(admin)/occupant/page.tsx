
"use client";

import React, { useEffect } from "react";
import { useFkUser } from "@/lib/hooks/useFkUser";
import { useOccupant } from "@/lib/hooks/useOccupant";
import OccupantMainCard from "@/components/techem/occupant/OccupantMainCard";
import { OccupantMetrics } from "@/components/techem/occupant/OccupantMetrics";
import OccupantRelevesCard from "@/components/techem/occupant/OccupantRelevesCard";
import OccupantDetailsClient from "@/components/techem/occupant/OccupantDetailsClient";

export default function OccupantPage() {
  const fkUser = useFkUser();
  const {
    occupantLogementData,
    occupantLogementIsLoading,
    occupantLogementError,
  } = useOccupant(fkUser); // <-- on passe fkUser au hook

  // Tant que fkUser n'est pas prêt, on affiche un loader
  if (fkUser === null || occupantLogementIsLoading) {
    return <div className="p-4">Chargement du contexte occupant...</div>;
  }

  if (occupantLogementError) {
    return <div className="p-4 text-red-600">{occupantLogementError}</div>;
  }

  const occupantData = occupantLogementData;

  // Calcul et stockage local de la consommation réelle (eau froide + eau chaude)
  useEffect(() => {
    if (!fkUser || !occupantData?.logement) return;

    try {
      const logement = occupantData.logement as any;

      const ecConso = Number(
        logement?.LogementEC?.ConsoPeriode?.Conso ??
          logement?.logementEC?.consoPeriode?.conso ??
          0,
      );
      const efConso = Number(
        logement?.LogementEF?.ConsoPeriode?.Conso ??
          logement?.logementEF?.consoPeriode?.conso ??
          0,
      );

      const dateDebStr =
        logement?.LogementEC?.ConsoPeriode?.DateDeb ??
        logement?.logementEC?.consoPeriode?.dateDeb ??
        logement?.LogementEF?.ConsoPeriode?.DateDeb ??
        logement?.logementEF?.consoPeriode?.dateDeb;
      const dateFinStr =
        logement?.LogementEC?.ConsoPeriode?.DateFin ??
        logement?.logementEC?.consoPeriode?.dateFin ??
        logement?.LogementEF?.ConsoPeriode?.DateFin ??
        logement?.logementEF?.consoPeriode?.dateFin;

      const dateDeb = dateDebStr ? new Date(dateDebStr) : null;
      const dateFin = dateFinStr ? new Date(dateFinStr) : null;

      let days = 30;
      if (dateDeb && dateFin && !Number.isNaN(dateDeb.getTime()) && !Number.isNaN(dateFin.getTime())) {
        const diffMs = dateFin.getTime() - dateDeb.getTime();
        const rawDays = diffMs / (1000 * 60 * 60 * 24);
        if (rawDays > 0) {
          days = rawDays;
        }
      }

      const totalM3 = (ecConso || 0) + (efConso || 0);
      const totalLiters = totalM3 * 1000;
      if (totalLiters <= 0 || !Number.isFinite(totalLiters)) {
        return;
      }

      const dailyLiters = totalLiters / days;
      const weeklyLiters = dailyLiters * 7;
      const monthlyLiters = dailyLiters * 30;

      const payload = {
        fkUser: String(fkUser),
        periodStart: dateDebStr ?? null,
        periodEnd: dateFinStr ?? null,
        days,
        efM3: efConso || 0,
        ecM3: ecConso || 0,
        totalM3,
        totalLiters,
        weeklyLiters,
        monthlyLiters,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "simulateur-conso-reelle",
          JSON.stringify(payload),
        );
      }
    } catch {
      // silencieux : pas bloquant pour l'affichage de la page
    }
  }, [fkUser, occupantData]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        {occupantData && <OccupantMainCard occupantData={occupantData} />}
        {occupantData && <OccupantMetrics occupantData={occupantData} />}
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-5">
        {occupantData && <OccupantRelevesCard occupantData={occupantData} />}
      </div>

      {occupantData && <OccupantDetailsClient occupantData={occupantData} />}
    </div>
  );
}
