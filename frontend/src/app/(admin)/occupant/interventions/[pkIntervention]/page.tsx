import { Metadata } from "next";
import OccupantInterventionDetailsClient from "./OccupantInterventionDetailsClient";

export const metadata: Metadata = {
  title: "Détail de l'intervention occupant | TECHEM - Espace client",
  description: "Détails d'une intervention de dépannage pour l'occupant",
};

export default function OccupantInterventionDetailsPage({
  params,
}: {
  params: { pkIntervention: string };
}) {
  const { pkIntervention } = params;

  return (
    <OccupantInterventionDetailsClient pkIntervention={pkIntervention} />
  );
}

