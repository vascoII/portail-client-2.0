import { Metadata } from "next";
import OperatorUpdateForm from "@/components/techem/operator/form/OperatorUpdateForm";

export const metadata: Metadata = {
  title: "Modifier Gestionnaire | TECHEM - Espace client",
  description: "Modifier un compte gestionnaire",
};

export default async function EditGestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <OperatorUpdateForm operatorId={id} />
  );
}

