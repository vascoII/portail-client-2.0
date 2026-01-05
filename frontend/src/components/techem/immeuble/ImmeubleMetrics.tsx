"use client";
import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import StatusIconsAlerte from '@/components/techem/images/StatusIconsAlerte';
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsDysfonctionnement from '@/components/techem/images/StatusIconsDysfonctionnement';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import { LoadingMetrics } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useExport } from "@/lib/hooks/useExport";
import Alert from "@/components/ui/alert/Alert";
import apiClient from "@/lib/api/client";

interface ImmeubleMetricsProps {
  pkImmeuble: string;
}

/**
 * Component displaying 4 immeuble metrics side by side:
 * - Fuites (nbFuites)
 * - Alarmes (nbDysfonctionnements)
 * - Anomalies (nbAnomalies)
 * - Depannages (nbDepannages)
 */
export const ImmeubleMetrics = ({ pkImmeuble }: ImmeubleMetricsProps) => {
  const { getImmeubleQuery } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = getImmeubleQuery(pkImmeuble);
  const livretModal = useModal();
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

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

      const dateBegin = formatDateForApi(dateStart);
      const dateEndFormatted = formatDateForApi(dateEnd);

      const response = await apiClient.get<Blob>(`immeuble/${pkImmeuble}/intervention`, {
        params: {
          "doc-type": exportType,
          "date-begin": dateBegin,
          "date-end": dateEndFormatted,
        },
        responseType: "blob",
      });

      const blob = response.data;
      const extension = exportType === "detail-excel-inte" ? "xlsx" : "pdf";
      const fileName = `immeuble-${pkImmeuble}-interventions-${exportType}-${dateStart}-${dateEnd}.${extension}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [dateStart, dateEnd, pkImmeuble]
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
  type ImmeubleMetrics = {
    NbFuites?: number;
    nbFuites?: number;
    NbDysfonctionnements?: number;
    nbDysfonctionnements?: number;
    NbAnomalies?: number;
    nbAnomalies?: number;
    NbDepannages?: number;
    nbDepannages?: number;
    DegresFuites?: number;
    degresFuites?: number;
    DegresDysfonctionnements?: number;
    degresDysfonctionnements?: number;
    DegresAnomalies?: number;
    degresAnomalies?: number;
    DegresDepannages?: number;
    degresDepannages?: number;
  };

  const sanitizeMetric = (value?: number) => Math.max(value ?? 0, 0);

  const metrics = useMemo(() => {
    const immeuble: ImmeubleMetrics = immeubleData?.immeuble ?? {};
    const immeubleEC: ImmeubleMetrics | null =
      immeuble && typeof immeuble === "object" && "ImmeubleEC" in immeuble
        ? (immeuble as { ImmeubleEC?: ImmeubleMetrics }).ImmeubleEC ?? null
        : null;

    return {
      fuites: sanitizeMetric(
        immeubleEC?.NbFuites ??
          immeubleEC?.nbFuites ??
          immeuble.NbFuites ??
          immeuble.nbFuites
      ),
      alarmes: sanitizeMetric(
        immeuble.NbDysfonctionnements ?? immeuble.nbDysfonctionnements
      ),
      anomalies: sanitizeMetric(
        immeubleEC?.NbAnomalies ??
          immeubleEC?.nbAnomalies ??
          immeuble.NbAnomalies ??
          immeuble.nbAnomalies
      ),
      depannages: sanitizeMetric(
        immeuble.NbDepannages ?? immeuble.nbDepannages
      ),
      degresFuites: sanitizeMetric(
        immeubleEC?.DegresFuites ??
          immeubleEC?.degresFuites ??
          immeuble.DegresFuites ??
          immeuble.degresFuites
      ),
      degresDysfonctionnements: sanitizeMetric(
        immeuble.DegresDysfonctionnements ?? immeuble.degresDysfonctionnements
      ),
      degresAnomalies: sanitizeMetric(
        immeubleEC?.DegresAnomalies ??
          immeubleEC?.degresAnomalies ??
          immeuble.DegresAnomalies ??
          immeuble.degresAnomalies
      ),
      degresDepannages: sanitizeMetric(
        immeuble.DegresDepannages ?? immeuble.degresDepannages
      ),
    };
  }, [immeubleData]);


  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (isImmeubleLoading) {
    return <LoadingMetrics count={4} />;
  }

  // Determine icon colors based on values
  const fuitesColor = metrics.fuites > 0 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
  const dysfonctionnementsColor = metrics.alarmes > 0 ? "text-orange-500 dark:text-orange-400" : "text-gray-400 dark:text-gray-500";
  const anomaliesColor = metrics.anomalies > 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500";
  const depannagesColor = metrics.depannages > 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <Link href={`/immeuble/${pkImmeuble}/fuites`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsFuite size={24} className={fuitesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Fuites</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(metrics.fuites)}
                </h4>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/immeuble/${pkImmeuble}/dysfonctionnements`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsDysfonctionnement size={24} className={dysfonctionnementsColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Alarmes techniques</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(metrics.alarmes)}
                </h4>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/immeuble/${pkImmeuble}/anomalies`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsAnomalie size={24} className={anomaliesColor} color="currentColor" />
            </div>

            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Anomalies de consommation</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(metrics.anomalies)}
                </h4>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/immeuble/${pkImmeuble}/interventions`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <StatusIconsAlerte size={24} className={depannagesColor} color="currentColor" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Depannages en cours</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {formatNumber(metrics.depannages)}
                </h4>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Livret d&apos;intervention
        </h3>
        {anyExportError && (
          <div>
            <Alert
              variant={anyExportError.variant || "error"}
              title={anyExportError.title}
              message={anyExportError.message}
              showLink={false}
            />
            <button
              onClick={clearAllExportErrors}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Fermer l&apos;alerte
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Date de début
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(event) => setDateStart(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Date de fin
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(event) => setDateEnd(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSyntheseExport}
            disabled={isSyntheseExporting || !dateStart || !dateEnd}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
          >
            <span>
              {isSyntheseExporting ? "Export en cours..." : "Synthèse des Interventions (format Pdf)"}
            </span>
            <svg
              className="h-4 w-4 text-red-500"
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
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
          >
            <span>
              {isDetailPdfExporting ? "Export en cours..." : "Détails des Interventions (format Pdf)"}
            </span>
            <svg
              className="h-4 w-4 text-red-500"
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
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
          >
            <span>
              {isDetailExcelExporting ? "Export en cours..." : "Détails des Interventions (format Excel)"}
            </span>
            <svg
              className="h-4 w-4 text-green-500"
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
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
};

