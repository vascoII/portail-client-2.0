"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import { useAlertes } from "@/lib/hooks/useAlertes";
import { LoadingTable } from "@/components/ui/loading";

export default function ListAlertes() {
  const fkUser = useFkUser();
  const { alertesData, alertesIsLoading, alertesError } = useAlertes(fkUser);

  if (!fkUser || alertesIsLoading) {
    return (
      <LoadingTable
        variant="spinner"
        message="Chargement des paramètres d'alerte..."
      />
    );
  }

  if (alertesError) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#b00511] bg-[#b00511] px-4 py-6 sm:px-6">
        <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
          <p className="font-medium mb-1">Erreur</p>
          <p className="text-sm">{alertesError}</p>
        </div>
      </div>
    );
  }

  const user = alertesData?.user;

  if (!user) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 py-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
        <p className="text-base text-[#1d1914]">
          Aucun paramètre d&apos;alerte disponible pour le moment.
        </p>
      </div>
    );
  }

  const isActive =
    user.Seuil_Conso_Actif === "O" || user.Seuil_Conso_Actif === true;

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-4 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-normal text-[#1d1914]">
            Paramètres d&apos;alerte
          </h3>
          <p className="text-base text-[#1d1914]">
            Visualisation des alertes configurées pour votre logement
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#1d1914] rounded-xl border border-[#1d1914] bg-[#e9ecef]">
        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-[#1d1914]">
            Alerte activée
          </div>
          <div className="text-sm text-[#1d1914]">
            {isActive ? "Oui" : "Non"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-[#1d1914]">
            E-mail de réception
          </div>
          <div className="text-sm text-[#1d1914]">
            {user.Seuil_Conso_Email || "Non renseigné"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-[#1d1914]">
            Seuil eau froide (m³)
          </div>
          <div className="text-sm text-[#1d1914]">
            {user.Seuil_Conso_EF ?? "Non défini"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-[#1d1914]">
            Seuil eau chaude (m³)
          </div>
          <div className="text-sm text-[#1d1914]">
            {user.Seuil_Conso_EC ?? "Non défini"}
          </div>
        </div>
      </div>

      {isActive === false && (
        <div className="mt-9">
          <div className="p-4 bg-[#009bb4] text-[#00344e] rounded-lg">
            <p className="font-medium mb-1">Alerte désactivée</p>
            <p className="text-sm">Vous pouvez activer vos alertes de consommation depuis l&apos;écran de configuration dédié (formulaire).</p>
          </div>
        </div>
      )}
    </div>
  );
}


