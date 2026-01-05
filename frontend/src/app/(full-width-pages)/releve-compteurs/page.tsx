import ReleveCompteursForm from "@/components/techem/occupant/form/releve-compteurs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Releve Compteurs | TECHEM - Espace client",
  description: "Releve compteurs",
};

export default function ReleveCompteursPage() {
  return <ReleveCompteursForm />;
}
