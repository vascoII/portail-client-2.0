"use client";
import React, { useMemo } from "react";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingCard } from "@/components/ui/loading";

interface LogementMainCardProps {
  pkLogement: string;
}

export default function LogementMainCard({ pkLogement }: LogementMainCardProps) {
  const { getLogementQuery } = useLogements();
  const { data: logementData, isLoading: isLogementLoading, error: logementError } = getLogementQuery(pkLogement);
  
  // Debug: Log loading state and errors
  console.log("[LogementMainCard] pkLogement:", pkLogement);
  console.log("[LogementMainCard] isLoading:", isLogementLoading);
  console.log("[LogementMainCard] error:", logementError);

  // Extract logement information from API response
  const logementInfo = useMemo(() => {
    // Early return if data is not loaded yet
    if (!logementData) {
      console.log("[LogementMainCard] No logementData available yet");
      return {
        nbCompteurs: 0,
        nbCompteursEf: 0,
        nbCompteursEc: 0,
        nbCompteursRepart: 0,
        nbCompteursCet: 0,
        occupantNom: "",
        occupantRef: "",
        occupantDateArrivee: "N/A",
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
    
    // Debug: Log raw data structure
    console.log("[LogementMainCard] Raw logementData:", logementData);
    console.log("[LogementMainCard] logementData type:", typeof logementData);
    console.log("[LogementMainCard] logementData keys:", logementData ? Object.keys(logementData) : "logementData is null/undefined");
    
    const logement = logementData?.logement;
    console.log("[LogementMainCard] Extracted logement:", logement);
    console.log("[LogementMainCard] logement type:", typeof logement);
    console.log("[LogementMainCard] logement keys:", logement ? Object.keys(logement) : "logement is null/undefined");
    
    // Try both PascalCase and camelCase
    // Also check if properties are directly on logement (flattened structure)
    const occupant = logement?.Occupant ?? logement?.occupant;
    const logementData_obj = logement?.Logement ?? logement?.logement;
    const immeuble = logement?.Immeuble ?? logement?.immeuble;
    
    // If Logement object doesn't exist, try to get properties directly from logement
    const logementProps = logementData_obj || logement;
    
    console.log("[LogementMainCard] Occupant:", occupant);
    console.log("[LogementMainCard] Logement object (nested):", logementData_obj);
    console.log("[LogementMainCard] Logement props (flattened or nested):", logementProps);
    console.log("[LogementMainCard] logementProps keys:", logementProps ? Object.keys(logementProps) : "logementProps is null/undefined");
    console.log("[LogementMainCard] Immeuble:", immeuble);
    
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

    const result = {
      nbCompteurs: (logement?.NbAppareils ?? logement?.nbAppareils ?? 0) as number,
      nbCompteursEf: (logement?.NbCompteursEF ?? logement?.nbCompteursEF ?? logement?.NbCompteursEf ?? logement?.nbCompteursEf ?? 0) as number,
      nbCompteursEc: (logement?.NbCompteursEC ?? logement?.nbCompteursEC ?? logement?.NbCompteursEc ?? logement?.nbCompteursEc ?? 0) as number,
      nbCompteursRepart: (logement?.NbCompteursRepart ?? logement?.nbCompteursRepart ?? 0) as number,
      nbCompteursCet: (logement?.NbCompteursCET ?? logement?.nbCompteursCET ?? logement?.NbCompteursCet ?? logement?.nbCompteursCet ?? 0) as number,
      // Occupant
      occupantNom: occupant?.Nom ?? occupant?.nom ?? "",
      occupantRef: occupant?.Ref ?? occupant?.ref ?? "",
      occupantDateArrivee: formatDate(occupant?.DateArrivee ?? occupant?.dateArrivee ?? occupant?.DateArrivée ?? occupant?.dateArrivée),
      // Logement - try both nested Logement object and direct properties
      logementAdrBatiment: logementProps?.AdrBatiment ?? logementProps?.adrBatiment ?? "",
      logementNumEscalier: logementProps?.NumEscalier ?? logementProps?.numEscalier ?? "",
      logementNumEtage: logementProps?.NumEtage ?? logementProps?.numEtage ?? "",
      logementType: logementProps?.Type ?? logementProps?.type ?? "",
      // Immeuble
      immeubleNom: immeuble?.Nom ?? immeuble?.nom ?? "",
      immeubleAdresse1: immeuble?.Adresse1 ?? immeuble?.adresse1 ?? "",
      immeubleCp: immeuble?.Cp ?? immeuble?.cp ?? "",
      immeubleVille: immeuble?.Ville ?? immeuble?.ville ?? "",
    };
    
    console.log("[LogementMainCard] Extracted logementInfo:", result);
    return result;
  }, [logementData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations du logement 
          </h4>

          {isLogementLoading ? (
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
                <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                  Occupant
                </h5>
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
