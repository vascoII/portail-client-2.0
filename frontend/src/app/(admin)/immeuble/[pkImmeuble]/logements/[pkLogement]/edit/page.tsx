import { Metadata } from "next";
import EditOccupantForm from "@/components/techem/logement/form/edit-occupant";

export const metadata: Metadata = {
  title: "Éditer l'occupant | TECHEM - Espace client",
  description: "Modification des informations de l'occupant du logement",
};

export default async function EditLogementPage({
  params,
}: {
  params: Promise<{ pkLogement: string }>;
}) {
  const { pkLogement } = await params;

  return <EditOccupantForm pkLogement={pkLogement} />;
}

