import { Metadata } from "next";
import OccupantInterventionsPageClient from "./OccupantInterventionsPageClient";

export const metadata: Metadata = {
  title: "Interventions | TECHEM - Espace client",
  description: "Liste des dépannages occupant",
};

export default function OccupantInterventionsPage() {
  return <OccupantInterventionsPageClient />;
}

