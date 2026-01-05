import { Metadata } from "next";
import ListAlertes from "@/components/techem/occupant/ListAlertes";

export const metadata: Metadata = {
  title: "Alertes | TECHEM - Espace client",
  description: "Paramètres d'alertes de consommation occupant",
};

export default function AlertesPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListAlertes />
      </div>
    </div>
  );
}

