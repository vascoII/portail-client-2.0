import { Metadata } from "next";
import OperatorUpdateForm from "@/components/techem/operator/form/OperatorUpdateForm";

export const metadata: Metadata = {
  title: "Modifier Gestionnaire | TECHEM - Espace client",
  description: "Modifier un compte gestionnaire",
};

export default function EditGestionnairePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <OperatorUpdateForm operatorId={params.id} />
  );
}

