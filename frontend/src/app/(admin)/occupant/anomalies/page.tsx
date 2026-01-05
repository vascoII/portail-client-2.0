import { Metadata } from "next";
import OccupantAnomaliesPageClient from "./OccupantAnomaliesPageClient";

export const metadata: Metadata = {
  title: "Anomalies | TECHEM - Espace client",
  description: "Liste des anomalies de consommation occupant",
};

export default function OccupantAnomaliesPage() {
  return <OccupantAnomaliesPageClient />;
}

