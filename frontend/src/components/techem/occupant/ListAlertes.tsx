"use client";

import { useFkUser } from "@/lib/hooks/useFkUser";
import { useAlertes } from "@/lib/hooks/useAlertes";
import Alert from "@/components/ui/alert/Alert";
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
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-6 dark:border-red-900/60 dark:bg-red-950/40 sm:px-6">
        <p className="text-sm text-red-700 dark:text-red-200">
          {alertesError}
        </p>
      </div>
    );
  }

  const user = alertesData?.user;

  if (!user) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucun paramètre d&apos;alerte disponible pour le moment.
        </p>
      </div>
    );
  }

  const isActive =
    user.Seuil_Conso_Actif === "O" || user.Seuil_Conso_Actif === true;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Paramètres d&apos;alerte
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisation des alertes configurées pour votre logement
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900/30">
        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Alerte activée
          </div>
          <div className="text-sm text-gray-900 dark:text-white">
            {isActive ? "Oui" : "Non"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            E-mail de réception
          </div>
          <div className="text-sm text-gray-900 dark:text-white">
            {user.Seuil_Conso_Email || "Non renseigné"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Seuil eau froide (m³)
          </div>
          <div className="text-sm text-gray-900 dark:text-white">
            {user.Seuil_Conso_EF ?? "Non défini"}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Seuil eau chaude (m³)
          </div>
          <div className="text-sm text-gray-900 dark:text-white">
            {user.Seuil_Conso_EC ?? "Non défini"}
          </div>
        </div>
      </div>

      {isActive === false && (
        <div className="mt-4">
          <Alert
            variant="info"
            title="Alerte désactivée"
            message="Vous pouvez activer vos alertes de consommation depuis l'écran de configuration dédié (formulaire)."
          />
        </div>
      )}
    </div>
  );
}


