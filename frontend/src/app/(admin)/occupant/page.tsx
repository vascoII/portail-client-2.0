
"use client";

import React from "react";
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
  if (fkUser && occupantData?.logement) {
      const logement = occupantData.logement as any;// eslint-disable-line @typescript-eslint/no-explicit-any

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

      // Persist consumption payload to local storage
      const consumptionPayload = {
        totalM3,
        totalLiters,
        dailyLiters,
        weeklyLiters,
        monthlyLiters,
        ecConso,
        efConso,
        dateDeb: dateDeb?.toISOString() ?? null,
        dateFin: dateFin?.toISOString() ?? null,
        days,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        `occupant_consumption_${fkUser}`,
        JSON.stringify(consumptionPayload),
      );
  }

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
