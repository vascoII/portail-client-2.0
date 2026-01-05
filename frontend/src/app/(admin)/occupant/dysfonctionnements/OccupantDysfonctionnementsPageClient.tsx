"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import ListDysfonctionnements from "@/components/techem/occupant/ListDysfonctionnements";

export default function OccupantDysfonctionnementsPageClient() {
  const fkUser = useFkUser();

  if (!fkUser) {
    return <div className="p-4">Chargement des alarmes techniques...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListDysfonctionnements fkUser={fkUser} />
      </div>
    </div>
  );
}


