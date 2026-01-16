import { Metadata } from "next";
import OccupantInterventionDetailsClient from "./OccupantInterventionDetailsClient";

export const metadata: Metadata = {
  title: "Détail de l'intervention occupant | TECHEM - Espace client",
  description: "Détails d'une intervention de dépannage pour l'occupant",
};

export default async function OccupantInterventionDetailsPage({
  params,
}: {
  params: Promise<{ pkIntervention: string }>;
}) {
  const { pkIntervention } = await params;

  return (
    <OccupantInterventionDetailsClient pkIntervention={pkIntervention} />
  );
}

