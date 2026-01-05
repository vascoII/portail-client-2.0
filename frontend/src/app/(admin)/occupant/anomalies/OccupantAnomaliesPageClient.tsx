"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import ListAnomalies from "@/components/techem/occupant/ListAnomalies";

export default function OccupantAnomaliesPageClient() {
  const fkUser = useFkUser();

  if (!fkUser) {
    return <div className="p-4">Chargement des anomalies...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListAnomalies fkUser={fkUser} />
      </div>
    </div>
  );
}


