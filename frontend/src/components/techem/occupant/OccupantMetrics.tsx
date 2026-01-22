"use client";
import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import StatusIconsAlerte from '@/components/techem/images/StatusIconsAlerte';
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsDysfonctionnement from '@/components/techem/images/StatusIconsDysfonctionnement';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import { LoadingMetrics } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useExport } from "@/lib/hooks/useExport";
import apiClient from "@/lib/api/client";
import { OccupantLogementResponse } from "@/lib/hooks/useOccupant";

/**
 * Component displaying 4 logement metrics side by side:
 * - Fuites (nbFuites)
 * - Alarmes (nbDysfonctionnements)
 * - Anomalies (nbAnomalies)
 * - Depannages (nbDepannages)
 */
export const OccupantMetrics = ({ occupantData }: { occupantData: OccupantLogementResponse }) => {
  const livretModal = useModal();
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Extract pkLogement and pkImmeuble from occupantData
  const pkLogement = occupantData?.logement?.Logement?.PkLogement ?? occupantData?.logement?.logement?.pkLogement ?? "";
  const pkImmeuble = occupantData?.logement?.Immeuble?.PkImmeuble ?? occupantData?.logement?.immeuble?.pkImmeuble ?? "";

  const formatDateForApi = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Date invalide, veuillez sélectionner une date valide.");
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadInterventionReport = useCallback(
    async (exportType: "synthese-inte" | "detail-inte" | "detail-excel-inte") => {
      if (!dateStart || !dateEnd) {
        throw new Error("Veuillez sélectionner une date de début et une date de fin.");
      }

      if (!pkImmeuble || !pkLogement) {
        throw new Error("Impossible de déterminer l'immeuble ou le logement.");
      }

      const dateBegin = formatDateForApi(dateStart);
      const dateEndFormatted = formatDateForApi(dateEnd);

      const response = await apiClient.get<Blob>(`immeuble/${pkImmeuble}/logements/${pkLogement}/intervention`, {
        params: {
          "doc-type": exportType,
          "date-begin": dateBegin,
          "date-end": dateEndFormatted,
        },
        responseType: "blob",
      });

      const blob = response.data;
      const extension = exportType === "detail-excel-inte" ? "xlsx" : "pdf";
      const fileName = `logement-${pkLogement}-interventions-${exportType}-${dateStart}-${dateEnd}.${extension}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [dateStart, dateEnd, pkImmeuble, pkLogement]
  );

  const syntheseExportFn = useCallback(
    () => downloadInterventionReport("synthese-inte"),
    [downloadInterventionReport]
  );

  const detailPdfExportFn = useCallback(
    () => downloadInterventionReport("detail-inte"),
    [downloadInterventionReport]
  );

  const detailExcelExportFn = useCallback(
    () => downloadInterventionReport("detail-excel-inte"),
    [downloadInterventionReport]
  );

  const {
    handleExport: handleSyntheseExport,
    isExporting: isSyntheseExporting,
    error: syntheseError,
    clearError: clearSyntheseError,
  } = useExport(syntheseExportFn, { errorTitle: "Erreur export synthèse" });

  const {
    handleExport: handleDetailPdfExport,
    isExporting: isDetailPdfExporting,
    error: detailPdfError,
    clearError: clearDetailPdfError,
  } = useExport(detailPdfExportFn, { errorTitle: "Erreur export PDF" });

  const {
    handleExport: handleDetailExcelExport,
    isExporting: isDetailExcelExporting,
    error: detailExcelError,
    clearError: clearDetailExcelError,
  } = useExport(detailExcelExportFn, { errorTitle: "Erreur export Excel" });

  const anyExportError = syntheseError || detailPdfError || detailExcelError;

  const clearAllExportErrors = () => {
    if (syntheseError) clearSyntheseError();
    if (detailPdfError) clearDetailPdfError();
    if (detailExcelError) clearDetailExcelError();
  };

  // Extract metrics from API response
  const metrics = useMemo(() => {
    const logement = occupantData?.logement;
    
    return {
      fuites: (logement?.LogementEF?.NbFuites ?? logement?.logementEF?.nbFuites ?? logement?.NbFuites ?? logement?.nbFuites ?? 0) as number,
      alarmes: (logement?.NbDysfonctionnements ?? logement?.nbDysfonctionnements ?? 0) as number,
      anomalies: (logement?.LogementEF?.NbAnomalies ?? logement?.logementEF?.nbAnomalies ?? logement?.NbAnomalies ?? logement?.nbAnomalies ?? 0) as number,
      depannages: (logement?.NbDepannages ?? logement?.nbDepannages ?? 0) as number,
    };
  }, [occupantData]);

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (!occupantData?.logement) {
    return <LoadingMetrics count={4} />;
  }

  // Determine icon colors based on values
  const fuitesColor = metrics.fuites > 0 ? "text-[#009bb4]" : "text-[#6a6a6a]";
  const dysfonctionnementsColor = metrics.alarmes > 0 ? "text-[#e20613]" : "text-[#6a6a6a]";
  const anomaliesColor = metrics.anomalies > 0 ? "text-[#b00511]" : "text-[#6a6a6a]";
  const depannagesColor = metrics.depannages > 0 ? "text-[#e20613]" : "text-[#6a6a6a]";

  return (
    <>
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-4 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {/* Fuites - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/fuites?fluide=EF`} className="h-full">
          <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
              <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-[#1d1914]">
                  Fuites
                </span>
                <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                  {formatNumber(Math.max(metrics.fuites, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
            <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
          </div>

          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-[#1d1914]">
                Fuites
              </span>
              <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                {formatNumber(Math.max(metrics.fuites, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Fuites - Metric Item End */}

      {/* Alarmes (Dysfonctionnements) - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/dysfonctionnements`} className="h-full">
          <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
              <StatusIconsDysfonctionnement size={24} className={dysfonctionnementsColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-[#1d1914]">
                  Alarmes techniques
                </span>
                <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                  {formatNumber(Math.max(metrics.alarmes, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
            <StatusIconsDysfonctionnement size={24} className={dysfonctionnementsColor} color="currentColor" />
          </div>
          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-[#1d1914]">
                Alarmes techniques
              </span>
              <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                {formatNumber(Math.max(metrics.alarmes, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Alarmes - Metric Item End */}

      {/* Anomalies - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/anomalies`} className="h-full">
          <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
              <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-[#1d1914]">
                  Anomalies de consommation
                </span>
                <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                  {formatNumber(Math.max(metrics.anomalies, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 h-[33px]"></div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
            <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
          </div>

          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-[#1d1914]">
                Anomalies de consommation
              </span>
              <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                {formatNumber(Math.max(metrics.anomalies, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 h-[33px]"></div>
        </div>
      )}
      {/* Anomalies - Metric Item End */}

      {/* Depannages - Metric Item Start */}
      {pkImmeuble && pkLogement ? (
        <Link href={`/occupant/interventions?statut=ouvert`} className="h-full">
          <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
              <StatusIconsAlerte size={24} className={depannagesColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5 flex-grow">
              <div>
                <span className="text-sm text-[#1d1914]">
                  Depannages en cours
                </span>
                <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                  {formatNumber(Math.max(metrics.depannages, 0))}
                </h4>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-lg border border-[#1d1914] px-3 py-1.5 text-xs font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613]"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  livretModal.openModal();
                }}
              >
                Livret d&apos;intervention
              </button>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col h-full rounded-xl border border-[#1d1914] bg-white p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-[#e9ecef] rounded-xl">
            <StatusIconsAlerte size={24} className={depannagesColor} color="currentColor" />
          </div>
          <div className="flex items-end justify-between mt-5 flex-grow">
            <div>
              <span className="text-sm text-[#1d1914]">
                Depannages en cours
              </span>
              <h4 className="mt-2 font-normal text-[#1d1914] text-title-sm">
                {formatNumber(Math.max(metrics.depannages, 0))}
              </h4>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className="rounded-lg border border-[#1d1914] px-3 py-1.5 text-xs font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                livretModal.openModal();
              }}
            >
              Livret d&apos;intervention
            </button>
          </div>
        </div>
      )}
      {/* Depannages - Metric Item End */}
    </div>
    </div>
    <Modal
      isOpen={livretModal.isOpen}
      onClose={() => {
        clearAllExportErrors();
        livretModal.closeModal();
      }}
      className="max-w-[520px] p-6"
    >
      <div className="space-y-6">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Livret d&apos;intervention
        </h3>
        {anyExportError && (
          <div>
            <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
              <p className="font-medium mb-1">{anyExportError.title}</p>
              <p className="text-sm">{anyExportError.message}</p>
            </div>
            <button
              onClick={clearAllExportErrors}
              className="mt-2 text-xs text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
            >
              Fermer l&apos;alerte
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-base text-[#1d1914] mb-2 block">
              Date de début
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(event) => setDateStart(event.target.value)}
              className="rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-base text-[#1d1914] mb-2 block">
              Date de fin
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(event) => setDateEnd(event.target.value)}
              className="rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSyntheseExport}
            disabled={isSyntheseExporting || !dateStart || !dateEnd}
            className="flex w-full items-center justify-between rounded-lg border border-[#1d1914] px-4 py-3 text-sm font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613] disabled:cursor-not-allowed disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none"
          >
            <span>
              {isSyntheseExporting ? "Export en cours..." : "Synthèse des Interventions (format Pdf)"}
            </span>
            <svg
              className="h-4 w-4 text-[#e20613]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2ZM13 9V3.5L18.5 9H13Z" />
              <path d="M8 13H16V15H8V13Z" />
              <path d="M8 17H16V19H8V17Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDetailPdfExport}
            disabled={isDetailPdfExporting || !dateStart || !dateEnd}
            className="flex w-full items-center justify-between rounded-lg border border-[#1d1914] px-4 py-3 text-sm font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613] disabled:cursor-not-allowed disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none"
          >
            <span>
              {isDetailPdfExporting ? "Export en cours..." : "Détails des Interventions (format Pdf)"}
            </span>
            <svg
              className="h-4 w-4 text-[#e20613]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2ZM13 9V3.5L18.5 9H13Z" />
              <path d="M8 13H16V15H8V13Z" />
              <path d="M8 17H16V19H8V17Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDetailExcelExport}
            disabled={isDetailExcelExporting || !dateStart || !dateEnd}
            className="flex w-full items-center justify-between rounded-lg border border-[#1d1914] px-4 py-3 text-sm font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613] disabled:cursor-not-allowed disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none"
          >
            <span>
              {isDetailExcelExporting ? "Export en cours..." : "Détails des Interventions (format Excel)"}
            </span>
            <svg
              className="h-4 w-4 text-[#417232]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 2H8C6.9 2 6 2.9 6 4V18H8V4H19V2Z" />
              <path d="M16 6H11C9.9 6 9 6.9 9 8V22C9 23.1 9.9 24 11 24H20C21.1 24 22 23.1 22 22V12L16 6ZM20 22H11V8H15V13H20V22Z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              clearAllExportErrors();
              livretModal.closeModal();
            }}
            className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-2 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe]"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
};

