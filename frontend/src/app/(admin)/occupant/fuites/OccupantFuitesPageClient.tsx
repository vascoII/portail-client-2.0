"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import ListFuites from "@/components/techem/occupant/ListFuites";

export default function OccupantFuitesPageClient() {
  const fkUser = useFkUser();

  if (!fkUser) {
    return <div className="p-4">Chargement des fuites...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListFuites fkUser={fkUser} />
      </div>
    </div>
  );
}


