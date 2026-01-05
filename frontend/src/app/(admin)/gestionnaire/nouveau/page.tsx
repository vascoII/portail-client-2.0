import { Metadata } from "next";
import OperatorCreateForm from "@/components/techem/operator/form/OperatorCreateForm";

export const metadata: Metadata = {
  title: "Nouveau Gestionnaire | TECHEM - Espace client",
  description: "Créer un nouveau compte gestionnaire",
};

export default function NewGestionnairePage() {
  return <OperatorCreateForm />;
}

