import { Metadata } from "next";
import NewOccupantForm from "@/components/techem/logement/form/new-occupant";

export const metadata: Metadata = {
  title: "Ajouter un occupant | TECHEM - Espace client",
  description: "Déclaration d'un nouvel occupant pour le logement",
};

export default async function DeclareOccupantPage({
  params,
}: {
  params: Promise<{ pkLogement: string }>;
}) {
  const { pkLogement } = await params;

  return <NewOccupantForm pkLogement={pkLogement} />;
}

