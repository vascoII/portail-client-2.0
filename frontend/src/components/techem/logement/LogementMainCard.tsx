"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingCard } from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/useAuth";

interface LogementMainCardProps {
  pkLogement: string;
  pkImmeuble?: string;
}

export default function LogementMainCard({ pkLogement, pkImmeuble }: LogementMainCardProps) {
  const { user } = useAuth();
  const { useLogementQuery } = useLogements();
  const { data: logementData, isLoading: isLogementLoading, error: logementError } = useLogementQuery(pkLogement);
  
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
        pkImmeuble: "",
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
      pkImmeuble: immeuble?.PkImmeuble ?? immeuble?.pkImmeuble ?? "",
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

  const effectivePkImmeuble = pkImmeuble ?? logementInfo.pkImmeuble;

  const canChangeOccupant = 
    user?.showChgtOccupant === true ||
    user?.showChgtOccupant === 1 ||
    user?.showChgtOccupant === "1";

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
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
                    Occupant
                  </h5>
                  {canChangeOccupant && effectivePkImmeuble && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/immeuble/${effectivePkImmeuble}/logements/${pkLogement}/edit`}
                        title="Éditer occupant"
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 rounded-full hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <span className="text-blue-600 dark:text-blue-400">
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 21 21" 
                            className="w-4 h-4" 
                            height="1em" 
                            width="1em" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M17.0911 3.53206C16.2124 2.65338 14.7878 2.65338 13.9091 3.53206L5.6074 11.8337C5.29899 12.1421 5.08687 12.5335 4.99684 12.9603L4.26177 16.445C4.20943 16.6931 4.286 16.9508 4.46529 17.1301C4.64458 17.3094 4.90232 17.3859 5.15042 17.3336L8.63507 16.5985C9.06184 16.5085 9.45324 16.2964 9.76165 15.988L18.0633 7.68631C18.942 6.80763 18.942 5.38301 18.0633 4.50433L17.0911 3.53206ZM14.9697 4.59272C15.2626 4.29982 15.7375 4.29982 16.0304 4.59272L17.0027 5.56499C17.2956 5.85788 17.2956 6.33276 17.0027 6.62565L16.1043 7.52402L14.0714 5.49109L14.9697 4.59272ZM13.0107 6.55175L6.66806 12.8944C6.56526 12.9972 6.49455 13.1277 6.46454 13.2699L5.96704 15.6283L8.32547 15.1308C8.46772 15.1008 8.59819 15.0301 8.70099 14.9273L15.0436 8.58468L13.0107 6.55175Z"
                            />
                          </svg>
                        </span>
                      </Link>
                      <Link
                        href={`/immeuble/${effectivePkImmeuble}/logements/${pkLogement}/declare-occupant`}
                        title="Ajouter un occupant"
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 rounded-full hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <span className="text-blue-600 dark:text-blue-400">
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 20 20" 
                            className="w-4 h-4" 
                            height="1em" 
                            width="1em" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.0254 6.17845C8.0254 4.90629 9.05669 3.875 10.3289 3.875C11.601 3.875 12.6323 4.90629 12.6323 6.17845C12.6323 7.45061 11.601 8.48191 10.3289 8.48191C9.05669 8.48191 8.0254 7.45061 8.0254 6.17845ZM10.3289 2.375C8.22827 2.375 6.5254 4.07786 6.5254 6.17845C6.5254 8.27904 8.22827 9.98191 10.3289 9.98191C12.4294 9.98191 14.1323 8.27904 14.1323 6.17845C14.1323 4.07786 12.4294 2.375 10.3289 2.375ZM8.92286 11.03C5.7669 11.03 3.2085 13.5884 3.2085 16.7444V17.0333C3.2085 17.4475 3.54428 17.7833 3.9585 17.7833C4.37271 17.7833 4.7085 17.4475 4.7085 17.0333V16.7444C4.7085 14.4169 6.59533 12.53 8.92286 12.53H11.736C14.0635 12.53 15.9504 14.4169 15.9504 16.7444V17.0333C15.9504 17.4475 16.2861 17.7833 16.7004 17.7833C17.1146 17.7833 17.4504 17.4475 17.4504 17.0333V16.7444C17.4504 13.5884 14.8919 11.03 11.736 11.03H8.92286Z"
                            />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
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
