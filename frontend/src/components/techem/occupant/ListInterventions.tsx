"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusIconsAlerte from "@/components/techem/images/StatusIconsAlerte";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOccupant } from "@/lib/hooks/useOccupant";
import { useExport } from "@/lib/hooks/useExport";
import { LoadingTable } from "@/components/ui/loading";
import type { Housing, DepannageRecord } from "@/lib/types/api";

interface ListInterventionsProps {
  fkUser: string;
}

const formatDate = (value?: string): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusClasses = (statut?: string): string => {
  if (!statut) {
    return "bg-[#e9ecef] text-[#1d1914]";
  }

  if (statut.toLowerCase() === "realise") {
    return "bg-[#417232] text-[#e9ecef]";
  }

  if (statut.toLowerCase() === "nonrealise") {
    return "bg-[#e20613] text-white";
  }

  return "bg-[#e9ecef] text-[#1d1914]";
};

const getInterventionNumber = (depannage: DepannageRecord): string => {
  const numero =
    depannage.Depannage?.Numero ??
    depannage.Depannage?.WorkOrderNumber ??
    "";
  return numero;
};

export default function ListInterventions({
  fkUser,
}: ListInterventionsProps) {
  const { getInterventions, exportInterventions } = useOccupant(fkUser);
  const router = useRouter();
  const [depannages, setDepannages] = useState<DepannageRecord[]>([]);
  const [_logement, setLogement] = useState<Housing | null>(null);// eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create wrapper function for Excel export
  const handleExportInterventionsExcel = useCallback(async () => {
    await exportInterventions();
  }, [exportInterventions]);

  // Create wrapper function for PDF export
  // TODO: Implement PDF export function when available
  const handleExportInterventionsPdf = useCallback(async () => {
    throw new Error("L'export PDF des interventions n'est pas encore disponible.");
  }, []);

  // Use the reusable export hooks
  const { 
    handleExport: handleExportExcel, 
    isExporting: isExportingExcel, 
    error: exportExcelError, 
    clearError: clearExportExcelError 
  } = useExport(handleExportInterventionsExcel, { errorTitle: "Erreur d'export Excel" });

  const { 
    handleExport: handleExportPdf, 
    isExporting: isExportingPdf, 
    error: exportPdfError, 
    clearError: clearExportPdfError 
  } = useExport(handleExportInterventionsPdf, { errorTitle: "Erreur d'export PDF" });

  useEffect(() => {
    let isMounted = true;

    const loadInterventions = async () => {
      if (!fkUser) {
        setErrorMessage("Identifiant de logement manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getInterventions();
        if (!isMounted) {
          return;
        }

        setDepannages(response.depannages ?? []);
        setLogement(response.logement ?? null);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error loading interventions:", error);
        if (isMounted) {
          setErrorMessage("Impossible de charger les dépannages.");
          setDepannages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInterventions();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fkUser]);

  const renderInterventionInfo = (depannage: DepannageRecord) => {
    const numero = getInterventionNumber(depannage);
    const refClient = depannage.Occupant?.Ref ?? "—";
    const etage = depannage.Logement?.NumEtage ?? "—";
    const numeroLogement = depannage.Logement?.NumOrdre ?? "—";
    const occupant = depannage.Occupant?.Nom ?? "—";

    return (
      <div className="space-y-1 text-sm text-[#1d1914]">
        {numero && (
          <p className="text-[#1d1914] font-medium">
            N° intervention : <span>{numero}</span>
          </p>
        )}
        <p>
          Référence client :{" "}
          <span className="text-[#1d1914]">{refClient}</span>
        </p>
        <p>
          Étage :{" "}
          <span className="text-[#1d1914]">{etage}</span>
        </p>
        <p>
          N° logement :{" "}
          <span className="text-[#1d1914]">
            {numeroLogement}
          </span>
        </p>
        <p className="text-[#1d1914] font-normal">{occupant}</p>
      </div>
    );
  };

  const renderObservation = (depannage: DepannageRecord) => {
    const statut = depannage.Depannage?.Statut;
    const compteRendu = depannage.Depannage?.CompteRendu;

    return (
      <div className="space-y-2">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
            statut
          )}`}
        >
          {statut ?? "—"}
        </span>
        {compteRendu && (
          <p className="text-sm text-[#1d1914] whitespace-pre-line">
            {compteRendu}
          </p>
        )}
      </div>
    );
  };

  const renderMotif = (depannage: DepannageRecord) => {
    const motif =
      depannage.Depannage?.MotifAbrege ?? depannage.Depannage?.Motif ?? "—";
    return (
      <p className="text-sm text-[#1d1914] whitespace-pre-line">
        {motif}
      </p>
    );
  };

  if (isLoading) {
    return (
      <LoadingTable 
        variant="spinner"
        message="Chargement des dépannages..."
      />
    );
  }

  if (errorMessage) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#b00511] bg-[#b00511] px-4 py-6 sm:px-6">
        <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
          <p className="font-medium mb-1">Erreur</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-4 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
      {(exportExcelError || exportPdfError) && (
        <div className="mb-9">
          <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
            <p className="font-medium mb-1">{(exportExcelError || exportPdfError)?.title || "Erreur"}</p>
            <p className="text-sm">{(exportExcelError || exportPdfError)?.message || ""}</p>
          </div>
          <button
            onClick={() => {
              if (exportExcelError) clearExportExcelError();
              if (exportPdfError) clearExportPdfError();
            }}
            className="mt-2 text-sm text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
          >
            Fermer
          </button>
        </div>
      )}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-normal text-[#1d1914]">
            Dépannages
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {depannages.length} dépannage{depannages.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filtrer
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel || depannages.length === 0}
            className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-2.5 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none inline-flex items-center gap-2"
          >
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.6667 11.6667V15.8333C16.6667 16.2754 16.4911 16.6993 16.1785 17.0118C15.866 17.3244 15.442 17.5 15 17.5H5C4.55797 17.5 4.13405 17.3244 3.82149 17.0118C3.50893 16.6993 3.33333 16.2754 3.33333 15.8333V11.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.33333 13.3333L10 15L11.6667 13.3333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 15V8.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.33333 8.33333L10 2.5L16.6667 8.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isExportingExcel ? "Export en cours..." : "Export Excel"}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || depannages.length === 0}
            className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-2.5 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none inline-flex items-center gap-2"
          >
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.6667 11.6667V15.8333C16.6667 16.2754 16.4911 16.6993 16.1785 17.0118C15.866 17.3244 15.442 17.5 15 17.5H5C4.55797 17.5 4.13405 17.3244 3.82149 17.0118C3.50893 16.6993 3.33333 16.2754 3.33333 15.8333V11.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.33333 13.3333L10 15L11.6667 13.3333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 15V8.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.33333 8.33333L10 2.5L16.6667 8.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isExportingPdf ? "Export en cours..." : "Export PDF"}
          </button>
        </div>
      </div>

      {depannages.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-[#1d1914]">
          <p className="text-base text-[#1d1914]">
            Aucun dépannage enregistré pour ce logement.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-y border-[#1d1914]">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Intervention
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Motif
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Observation
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#1d1914]">
            {depannages.map((depannage, index) => {
              const numeroIntervention = getInterventionNumber(depannage);
              const pkLogement =
                depannage.Logement?.PkLogement ??
                // support alternative casing if present
                (depannage.Logement as unknown as { pkLogement?: string | number })?.pkLogement ??
                "";
              const key = numeroIntervention || `depannage-${index}`;
              return (
                <TableRow
                  key={key}
                  className="align-top cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  onClick={() => {
                    if (!numeroIntervention) return;
                    const basePath = `/occupant/interventions/${numeroIntervention}`;
                    const url =
                      pkLogement !== ""
                        ? `${basePath}?pkLogement=${encodeURIComponent(String(pkLogement))}`
                        : basePath;
                    router.push(url);
                  }}
                >
                  <TableCell className="py-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
                        <StatusIconsAlerte
                          size={22}
                          className="text-amber-600 dark:text-amber-300"
                        />
                      </div>
                      {renderInterventionInfo(depannage)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-gray-700 dark:text-gray-200">
                    {formatDate(depannage.Depannage?.Date)}
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    {renderMotif(depannage)}
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    {renderObservation(depannage)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
