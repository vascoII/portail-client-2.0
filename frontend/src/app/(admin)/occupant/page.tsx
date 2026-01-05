
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
