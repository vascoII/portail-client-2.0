import { Metadata } from "next";
import OccupantFuitesPageClient from "./OccupantFuitesPageClient";

export const metadata: Metadata = {
  title: "Fuites | TECHEM - Espace client",
  description: "Liste des fuites occupant",
};

export default function OccupantFuitesPage() {
  return <OccupantFuitesPageClient />;
}

