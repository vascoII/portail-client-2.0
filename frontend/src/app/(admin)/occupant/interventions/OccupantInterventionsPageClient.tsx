"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import ListInterventions from "@/components/techem/occupant/ListInterventions";

export default function OccupantInterventionsPageClient() {
  const fkUser = useFkUser();

  if (!fkUser) {
    return <div className="p-4">Chargement des dépannages...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions fkUser={fkUser} />
      </div>
    </div>
  );
}


