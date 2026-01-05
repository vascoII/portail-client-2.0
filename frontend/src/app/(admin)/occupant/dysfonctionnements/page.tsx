import { Metadata } from "next";
import OccupantDysfonctionnementsPageClient from "./OccupantDysfonctionnementsPageClient";

export const metadata: Metadata = {
  title: "Dysfonctionnements | TECHEM - Espace client",
  description: "Liste des alarmes techniques occupant",
};

export default function OccupantDysfonctionnementsPage() {
  return <OccupantDysfonctionnementsPageClient />;
}

