"use client";

import InterventionDetails from "@/components/techem/immeuble/InterventionDetails";
import { useFkUser } from "@/lib/hooks/useFkUser";

interface OccupantInterventionDetailsClientProps {
  pkIntervention: string;
}

export default function OccupantInterventionDetailsClient({
  pkIntervention,
}: OccupantInterventionDetailsClientProps) {
  const fkUser = useFkUser();

  if (!fkUser) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chargement des détails de l&apos;intervention...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <InterventionDetails
        pkIntervention={pkIntervention}
        mode="occupant"
        fkOccupant={fkUser}
      />
    </div>
  );
}


