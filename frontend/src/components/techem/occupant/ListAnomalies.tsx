"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import StatusIconsAnomalie from "@/components/techem/images/StatusIconsAnomalie";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnomalies } from "@/lib/hooks/useAnomalies";
import { useExport } from "@/lib/hooks/useExport";
import Alert from "@/components/ui/alert/Alert";
import { LoadingTable } from "@/components/ui/loading";
import type { Housing, Anomaly } from "@/lib/types/api";

interface ListAnomaliesProps {
  fkUser: string;
}

export default function ListAnomalies({ fkUser }: ListAnomaliesProps) {
  const { getAnomalies, exportAnomalies } = useAnomalies(fkUser);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [logement, setLogement] = useState<Housing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create wrapper function for Excel export
  const handleExportAnomaliesExcel = useCallback(async () => {
    await exportAnomalies();
  }, [exportAnomalies]);

  // Create wrapper function for PDF export
  // TODO: Implement PDF export function when available
  const handleExportAnomaliesPdf = useCallback(async () => {
    throw new Error("L'export PDF des anomalies n'est pas encore disponible.");
  }, []);

  // Use the reusable export hooks
  const { 
    handleExport: handleExportExcel, 
    isExporting: isExportingExcel, 
    error: exportExcelError, 
    clearError: clearExportExcelError 
  } = useExport(handleExportAnomaliesExcel, { errorTitle: "Erreur d'export Excel" });

  const { 
    handleExport: handleExportPdf, 
    isExporting: isExportingPdf, 
    error: exportPdfError, 
    clearError: clearExportPdfError 
  } = useExport(handleExportAnomaliesPdf, { errorTitle: "Erreur d'export PDF" });

  useEffect(() => {
    let isMounted = true;

    const loadAnomalies = async () => {
      try {
        setIsLoading(true);
        const response = await getAnomalies();
        if (!isMounted) {
          return;
        }

        setAnomalies(response.anomalies ?? []);
        setLogement(response.logement ?? null);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error loading anomalies:", error);
        if (isMounted) {
          setErrorMessage("Impossible de charger les anomalies.");
          setAnomalies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (fkUser) {
      loadAnomalies();
    } else {
      setErrorMessage("Identifiant de logement manquant.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fkUser]);

  const totalAnomalies = useMemo(() => anomalies.length, [anomalies]);

  if (isLoading) {
    return (
      <LoadingTable 
        variant="spinner"
        message="Chargement des anomalies..."
      />
    );
  }

  if (errorMessage) {
    return (
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-6 dark:border-red-900/60 dark:bg-red-950/40 sm:px-6">
        <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {(exportExcelError || exportPdfError) && (
        <div className="mb-4">
          <Alert
            variant={(exportExcelError || exportPdfError)?.variant || "error"}
            title={(exportExcelError || exportPdfError)?.title || "Erreur"}
            message={(exportExcelError || exportPdfError)?.message || ""}
            showLink={false}
          />
          <button
            onClick={() => {
              if (exportExcelError) clearExportExcelError();
              if (exportPdfError) clearExportPdfError();
            }}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Fermer
          </button>
        </div>
      )}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Anomalies de consommation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalAnomalies} anomalie{totalAnomalies > 1 ? "s" : ""}
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
            disabled={isExportingExcel || anomalies.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
            disabled={isExportingPdf || anomalies.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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

      {anomalies.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune anomalie de consommation signalée pour ce logement.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Nombre Anomalies de consommation
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Index
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Conso
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                OBSERVATION
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {anomalies.map((anomalie, index) => {
              const key = anomalie.PkAnomalie ?? anomalie.Appareil?.Numero ?? `anomalie-${index}`;
              const indexValue = anomalie.Anomalie?.Index ?? "—";
              const conso = anomalie.Anomalie?.Conso ?? "—";
              const observations = anomalie.Anomalie?.Observations ?? "—";
              const rawFluide = anomalie.Appareil?.Fluide ?? "";
              const fluide =
                rawFluide === "EC"
                  ? "Eau chaude"
                  : rawFluide === "EF"
                  ? "Eau froide"
                  : rawFluide || "—";

              return (
                <TableRow key={key} className="align-top">
                  <TableCell className="py-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
                        <StatusIconsAnomalie
                          size={22}
                          className="text-amber-600 dark:text-amber-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          1
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {anomalie.Occupant?.Ref ?? "Réf. client inconnue"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Logement {anomalie.Logement?.NumOrdre ?? "—"} –{" "}
                          {anomalie.Occupant?.Nom ?? "Occupant inconnu"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Étage {anomalie.Logement?.NumEtage ?? "—"} | Bât.{" "}
                          {anomalie.Logement?.NumBatiment ?? "—"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          N° compteur: {anomalie.Appareil?.Numero ?? "—"} | {fluide}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Emplacement: {anomalie.Appareil?.Emplacement ?? "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-gray-700 dark:text-gray-200">
                    {indexValue}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-gray-700 dark:text-gray-200">
                    {conso}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
                    {observations}
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
