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
import { useLogements } from "@/lib/hooks/useLogements";
import { useExport } from "@/lib/hooks/useExport";
import { LoadingTable } from "@/components/ui/loading";
import type { Housing, Anomaly } from "@/lib/types/api";

interface ListAnomaliesProps {
  pkLogement: string;
}

export default function ListAnomalies({ pkLogement }: ListAnomaliesProps) {
  const { getAnomalies, exportAnomalies } = useLogements();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [logement, setLogement] = useState<Housing | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create wrapper function for Excel export
  const handleExportAnomaliesExcel = useCallback(async () => {
    await exportAnomalies(pkLogement);
  }, [exportAnomalies, pkLogement]);

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
        const response = await getAnomalies(pkLogement);
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

    if (pkLogement) {
      loadAnomalies();
    } else {
      setErrorMessage("Identifiant de logement manquant.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkLogement]);

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
            Anomalies de consommation
          </h3>
          <p className="text-sm text-[#1d1914]">
            {totalAnomalies} anomalie{totalAnomalies > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#1d1914] bg-white px-4 py-2.5 text-sm font-normal text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613] transition-all duration-300">
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
            className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
              isExportingExcel || anomalies.length === 0
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
            disabled={isExportingPdf || anomalies.length === 0}
            className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
              isExportingPdf || anomalies.length === 0
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

      {anomalies.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-[#1d1914]">
          <p className="text-base text-[#1d1914]">
            Aucune anomalie de consommation signalée pour ce logement.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-y border-[#1d1914]">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Nombre Anomalies de consommation
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Index
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                Conso
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-sm font-normal text-[#1d1914]"
              >
                OBSERVATION
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#1d1914]">
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
                      <div className="flex-shrink-0 rounded-xl bg-[#e9ecef] p-3">
                        <StatusIconsAnomalie
                          size={22}
                          className="text-[#b00511]"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-normal text-[#1d1914]">
                          1
                        </p>
                        <p className="text-xs uppercase tracking-wide text-[#1d1914]">
                          {anomalie.Occupant?.Ref ?? "Réf. client inconnue"}
                        </p>
                        <p className="text-sm text-[#1d1914]">
                          Logement {anomalie.Logement?.NumOrdre ?? "—"} –{" "}
                          {anomalie.Occupant?.Nom ?? "Occupant inconnu"}
                        </p>
                        <p className="text-sm text-[#1d1914]">
                          Étage {anomalie.Logement?.NumEtage ?? "—"} | Bât.{" "}
                          {anomalie.Logement?.NumBatiment ?? "—"}
                        </p>
                        <p className="text-sm text-[#1d1914]">
                          N° compteur: {anomalie.Appareil?.Numero ?? "—"} | {fluide}
                        </p>
                        <p className="text-sm text-[#1d1914]">
                          Emplacement: {anomalie.Appareil?.Emplacement ?? "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-[#1d1914]">
                    {indexValue}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-[#1d1914]">
                    {conso}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm text-[#1d1914] whitespace-pre-line">
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
