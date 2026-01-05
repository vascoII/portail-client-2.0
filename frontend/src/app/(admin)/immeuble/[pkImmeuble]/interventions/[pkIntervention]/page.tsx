import { Metadata } from "next";
import InterventionDetails from "@/components/techem/immeuble/InterventionDetails";

export const metadata: Metadata = {
  title: "Détail de l'intervention | TECHEM - Espace client",
  description: "Détails d'une intervention de dépannage",
};

export default function InterventionDetailsPage({
  params,
}: {
  params: { pkImmeuble: string; pkIntervention: string };
}) {
  const { pkImmeuble, pkIntervention } = params;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <InterventionDetails
        pkImmeuble={pkImmeuble}
        pkIntervention={pkIntervention}
      />
    </div>
  );
}

