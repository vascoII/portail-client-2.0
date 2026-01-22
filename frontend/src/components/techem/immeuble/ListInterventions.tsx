"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import StatusIconsAlerte from "@/components/techem/images/StatusIconsAlerte";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { useExport } from "@/lib/hooks/useExport";
import { LoadingTable } from "@/components/ui/loading";
import type { Building, DepannageRecord } from "@/lib/types/api";

interface ListInterventionsProps {
  pkImmeuble: string;
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
    return "bg-[#417232] text-white";
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
  pkImmeuble,
}: ListInterventionsProps) {
  const { getInterventions, exportInterventions } = useImmeubles();
  const router = useRouter();
  const [depannages, setDepannages] = useState<DepannageRecord[]>([]);
  const [immeuble, setImmeuble] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create wrapper function for Excel export
  const handleExportInterventionsExcel = useCallback(async () => {
    await exportInterventions(pkImmeuble);
  }, [exportInterventions, pkImmeuble]);

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
      if (!pkImmeuble) {
        setErrorMessage("Identifiant d'immeuble manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getInterventions(pkImmeuble);
        if (!isMounted) {
          return;
        }

        setDepannages(response.depannages ?? []);
        setImmeuble(response.immeuble ?? null);
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
  }, [pkImmeuble]);

  const renderInterventionInfo = (depannage: DepannageRecord) => {
    const numero = getInterventionNumber(depannage);
    const refClient = depannage.Occupant?.Ref ?? "—";
    const etage = depannage.Logement?.NumEtage ?? "—";
    const numeroLogement = depannage.Logement?.NumOrdre ?? "—";
    const occupant = depannage.Occupant?.Nom ?? "—";

    return (
      <div className="space-y-1 text-sm text-[#1d1914]">
        {numero && (
          <p className="text-[#1d1914] font-normal">
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
          className={`inline-flex rounded-full px-3 py-1 text-xs font-normal ${getStatusClasses(
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
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 py-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
        <div className="p-4 bg-[#b00511] text-white rounded-lg">
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-4 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
      {(exportExcelError || exportPdfError) && (
        <div className="mb-4">
          <div className="p-4 bg-[#b00511] text-white rounded-lg">
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
            {immeuble?.Nom ? `Dépannages – ${immeuble.Nom}` : "Dépannages"}
          </h3>
          <p className="text-sm text-[#1d1914]">
            {depannages.length} dépannage{depannages.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#1d1914] bg-white px-4 py-2.5 text-sm font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613]">
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
            className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
              isExportingExcel || depannages.length === 0
                ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613]"
            }`}
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
            className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
              isExportingExcel || depannages.length === 0
                ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613]"
            }`}
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
            Aucun dépannage enregistré pour cet immeuble.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-y border-[#1d1914]">
            <TableRow>
              <TableCell
                isHeader
                className="w-2/5 py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Intervention
              </TableCell>
              <TableCell
                isHeader
                className="w-1/6 py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="w-1/4 py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Motif
              </TableCell>
              <TableCell
                isHeader
                className="w-1/5 py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Observation
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#1d1914]">
            {depannages.map((depannage, index) => {
              const numeroIntervention = getInterventionNumber(depannage);
              const key = numeroIntervention || `depannage-${index}`;
              return (
                <TableRow
                  key={key}
                  className="align-top cursor-pointer hover:bg-[#ffe5e6] transition-all duration-300"
                  onClick={() => {
                    if (numeroIntervention) {
                      router.push(
                        `/immeuble/${pkImmeuble}/interventions/${numeroIntervention}`
                      );
                    }
                  }}
                >
                  <TableCell className="w-2/5 py-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 rounded-xl bg-[#e9ecef] p-3">
                        <StatusIconsAlerte
                          size={22}
                          className="text-[#e20613]"
                        />
                      </div>
                      {renderInterventionInfo(depannage)}
                    </div>
                  </TableCell>
                  <TableCell className="w-1/6 py-4 align-top text-sm text-[#1d1914]">
                    {formatDate(depannage.Depannage?.Date)}
                  </TableCell>
                  <TableCell className="w-1/4 py-4 align-top">
                    {renderMotif(depannage)}
                  </TableCell>
                  <TableCell className="w-1/5 py-4 align-top max-w-xs">
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
