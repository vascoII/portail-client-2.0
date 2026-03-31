"use client";
import React, { useCallback, useMemo } from "react";
import { OccupantLogementResponse } from "@/lib/hooks/useOccupant";
import { LoadingCard } from "@/components/ui/loading";
import Alert from "@/components/ui/alert/Alert";
import { api, handleApiError } from "@/lib/api/client";
import { useExport } from "@/lib/hooks/useExport";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _OccupantMainCardProps {
  occupantData: OccupantLogementResponse;
}

export default function OccupantMainCard({ occupantData }: { occupantData: OccupantLogementResponse }) {
  // Extract logement information from API response
  const logementInfo = useMemo(() => {
    // Early return if data is not loaded yet
    if (!occupantData?.logement) {
      return {
        nbCompteurs: 0,
        nbCompteursEf: 0,
        nbCompteursEc: 0,
        nbCompteursRepart: 0,
        nbCompteursCet: 0,
        occupantNom: "",
        occupantRef: "",
        occupantDateArrivee: "N/A",
        pkOccupant: "",
        pkImmeuble: "",
        logementAdrBatiment: "",
        logementNumEscalier: "",
        logementNumEtage: "",
        logementType: "",
        immeubleNom: "",
        immeubleAdresse1: "",
        immeubleCp: "",
        immeubleVille: "",
      };
    }
    
    const logement = occupantData.logement;
    const occupant = logement?.Occupant ?? logement?.occupant;
    const logementData_obj = logement?.Logement ?? logement?.logement;
    const immeuble = logement?.Immeuble ?? logement?.immeuble;
    
    // If Logement object doesn't exist, try to get properties directly from logement
    const logementProps = logementData_obj || logement;
    
    // Format date d'arrivée
    const formatDate = (dateString?: string): string => {
      if (!dateString || dateString === "0001-01-01T00:00:00") return "N/A";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        return dateString;
      }
    };

    return {
      nbCompteurs: (logement?.NbAppareils ?? logement?.nbAppareils ?? 0) as number,
      nbCompteursEf: (logement?.NbCompteursEF ?? logement?.nbCompteursEF ?? logement?.NbCompteursEf ?? logement?.nbCompteursEf ?? 0) as number,
      nbCompteursEc: (logement?.NbCompteursEC ?? logement?.nbCompteursEC ?? logement?.NbCompteursEc ?? logement?.nbCompteursEc ?? 0) as number,
      nbCompteursRepart: (logement?.NbCompteursRepart ?? logement?.nbCompteursRepart ?? 0) as number,
      nbCompteursCet: (logement?.NbCompteursCET ?? logement?.nbCompteursCET ?? logement?.NbCompteursCet ?? logement?.nbCompteursCet ?? 0) as number,
      // Occupant
      pkOccupant: (occupant?.PkOccupant ?? occupant?.pkOccupant ?? "") as string | number,
      occupantNom: occupant?.Nom ?? occupant?.nom ?? "",
      occupantRef: occupant?.Ref ?? occupant?.ref ?? "",
      occupantDateArrivee: formatDate(occupant?.DateArrivee ?? occupant?.dateArrivee ?? occupant?.DateArrivée ?? occupant?.dateArrivée),
      // Logement - try both nested Logement object and direct properties
      logementAdrBatiment: logementProps?.AdrBatiment ?? logementProps?.adrBatiment ?? "",
      logementNumEscalier: logementProps?.NumEscalier ?? logementProps?.numEscalier ?? "",
      logementNumEtage: logementProps?.NumEtage ?? logementProps?.numEtage ?? "",
      logementType: logementProps?.Type ?? logementProps?.type ?? "",
      // Immeuble
      pkImmeuble: (immeuble?.PkImmeuble ?? immeuble?.pkImmeuble ?? "") as string | number,
      immeubleNom: immeuble?.Nom ?? immeuble?.nom ?? "",
      immeubleAdresse1: immeuble?.Adresse1 ?? immeuble?.adresse1 ?? "",
      immeubleCp: immeuble?.Cp ?? immeuble?.cp ?? "",
      immeubleVille: immeuble?.Ville ?? immeuble?.ville ?? "",
    };
  }, [occupantData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  const effectivePkOccupant = logementInfo.pkOccupant ? String(logementInfo.pkOccupant) : "";
  const effectivePkImmeuble = logementInfo.pkImmeuble ? String(logementInfo.pkImmeuble) : "";

  const downloadReleveNote = useCallback(
    async (energie: "CHAUFFAGE" | "EAU") => {
      try {
        if (!effectivePkOccupant) {
          throw new Error("Identifiant occupant manquant pour l'export.");
        }
        if (!effectivePkImmeuble) {
          throw new Error("Identifiant immeuble manquant pour l'export.");
        }

        const response = await api.get(
          `/occupant/${effectivePkOccupant}/releve-note/${effectivePkImmeuble}/${energie}`,
          { responseType: "blob" }
        );

        const blob = new Blob([response.data as unknown as BlobPart], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `occupant-${effectivePkOccupant}-releve-note-${energie.toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const message = handleApiError(err);
        throw new Error(message || "Erreur lors de l'export.");
      }
    },
    [effectivePkImmeuble, effectivePkOccupant]
  );

  const {
    handleExport: handleExportChauffage,
    isExporting: isExportingChauffage,
    error: exportChauffageError,
    clearError: clearExportChauffageError,
  } = useExport(() => downloadReleveNote("CHAUFFAGE"), { errorTitle: "Erreur export conso chauffage" });

  const {
    handleExport: handleExportEau,
    isExporting: isExportingEau,
    error: exportEauError,
    clearError: clearExportEauError,
  } = useExport(() => downloadReleveNote("EAU"), { errorTitle: "Erreur export conso eau" });

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations du logement 
          </h4>

          {!occupantData?.logement ? (
            <LoadingCard 
              title="Informations du logement" 
              rows={2} 
              columns={[1, 4]} 
              showTitle={false}
            />
          ) : (
            <div className="space-y-6">
              {/* Informations Occupant */}
              <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
                    Occupant
                  </h5>
                  {effectivePkOccupant && effectivePkImmeuble && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={handleExportChauffage}
                        disabled={isExportingChauffage}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
                      >
                        {isExportingChauffage ? "Export..." : "Export Info Conso Chauffage"}
                      </button>
                      <button
                        type="button"
                        onClick={handleExportEau}
                        disabled={isExportingEau}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
                      >
                        {isExportingEau ? "Export..." : "Export Conso Eau"}
                      </button>
                    </div>
                  )}
                </div>
                {(exportChauffageError || exportEauError) && (
                  <div className="mb-3">
                    {exportChauffageError && (
                      <div className="mb-2">
                        <Alert
                          variant={exportChauffageError.variant || "error"}
                          title={exportChauffageError.title}
                          message={exportChauffageError.message}
                          showLink={false}
                        />
                        <button
                          type="button"
                          onClick={clearExportChauffageError}
                          className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Fermer
                        </button>
                      </div>
                    )}
                    {exportEauError && (
                      <div>
                        <Alert
                          variant={exportEauError.variant || "error"}
                          title={exportEauError.title}
                          message={exportEauError.message}
                          showLink={false}
                        />
                        <button
                          type="button"
                          onClick={clearExportEauError}
                          className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Fermer
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.occupantNom || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Référence</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.occupantRef || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date d&apos;arrivée</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.occupantDateArrivee}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations Logement */}
              <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                  Logement
                </h5>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse bâtiment</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.logementAdrBatiment || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">N° Escalier</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.logementNumEscalier || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">N° Étage</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.logementNumEtage || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.logementType || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations Immeuble */}
              <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                  Immeuble
                </h5>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.immeubleNom || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.immeubleAdresse1 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Code postal</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.immeubleCp || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ville</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {logementInfo.immeubleVille || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* First row - 1 column: Nombre d'Appareils */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800">
                  <center>
                    <p className="mb-2 text-2xl  leading-normal text-gray-500 dark:text-gray-400">
                    Nombre d&apos;appareils
                    </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(logementInfo.nbCompteurs)}
                </p>  
                  </center>
                </div>
              </div>

              {/* Second row - 4 columns: Eau froide, Eau chaude, Répartiteurs, Compteur d'énergie */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Eau froide
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(logementInfo.nbCompteursEf)}
                  </p>
                  </center>
                </div>

                  <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Eau chaude
                  </p>
                  </center>
                  <center>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(logementInfo.nbCompteursEc)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Répartiteurs
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(logementInfo.nbCompteursRepart)}
                      </p>
                  </center>
                </div>

                <div>
                  <center>
                  <p className="mb-2 text-xl leading-normal text-gray-500 dark:text-gray-400">
                    Compteur d&apos;énergie
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(logementInfo.nbCompteursCet)}
                  </p>
                  </center>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
