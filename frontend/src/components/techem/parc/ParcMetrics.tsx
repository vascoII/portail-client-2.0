"use client";
import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParc } from "@/lib/hooks/useParc";
import StatusIconsAlerte from '@/components/techem/images/StatusIconsAlerte';
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsDysfonctionnement from '@/components/techem/images/StatusIconsDysfonctionnement';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import { LoadingMetrics } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useExport } from "@/lib/hooks/useExport";
import apiClient from "@/lib/api/client";
// + NEW
import DatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';


/**
 * Component displaying 4 parc metrics side by side:
 * - Fuites (nbFuites)
 * - Alarmes (nbDysfonctionnements)
 * - Anomalies (nbAnomalies)
 * - Depannages (nbDepannages)
 */
export const ParcMetrics = () => {
  const { parcData, isParcLoading } = useParc();
  const livretModal = useModal();  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatDateForApi = (value: Date) => {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error("Date invalide, veuillez sélectionner une date valide.");
    }
    return format(value, 'dd/MM/yyyy'); // ex: 31/12/2025
  };

  // Aides
  const isRangeValid = !!(startDate && endDate && startDate <= endDate);
  const safeFilePart = (d: Date | null) => (d ? format(d, 'yyyy-MM-dd') : '');
  
  const downloadInterventionReport = useCallback(
    async (exportType: "synthese-inte" | "detail-inte" | "detail-excel-inte") => {
      if (!startDate || !endDate) {
        throw new Error("Veuillez sélectionner une date de début et une date de fin.");
      }
      if (startDate > endDate) {
        throw new Error("La date de début doit être antérieure ou égale à la date de fin.");
      }

      const dateBegin = formatDateForApi(startDate);
      const dateEndFormatted = formatDateForApi(endDate);

      const response = await apiClient.get<Blob>("parc/intervention", {
        params: {
          "doc-type": exportType,
          "date-begin": dateBegin,
          "date-end": dateEndFormatted,
        },
        responseType: "blob",
      });

      const blob = response.data;
      const extension = exportType === "detail-excel-inte" ? "xlsx" : "pdf";
      const fileName = `interventions-${exportType}-${safeFilePart(startDate)}-${safeFilePart(endDate)}.${extension}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [startDate, endDate]
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
  type BoardMetrics = {
    nbFuites?: number;
    nbDysfonctionnements?: number;
    nbAnomalies?: number;
    nbDepannages?: number;
    degresFuites?: number;
    degresDysfonctionnements?: number;
    degresAnomalies?: number;
    degresDepannages?: number;
  };

  const metrics = useMemo(() => {
    const board: BoardMetrics = parcData?.board ?? {};

    const sanitizeMetric = (value?: number) => Math.max(value ?? 0, 0);

    return {
      fuites: sanitizeMetric(board.nbFuites),
      alarmes: sanitizeMetric(board.nbDysfonctionnements),
      anomalies: sanitizeMetric(board.nbAnomalies),
      depannages: sanitizeMetric(board.nbDepannages),
      degresFuites: sanitizeMetric(board.degresFuites),
      degresDysfonctionnements: sanitizeMetric(board.degresDysfonctionnements),
      degresAnomalies: sanitizeMetric(board.degresAnomalies),
      degresDepannages: sanitizeMetric(board.degresDepannages),
    };
  }, [parcData]);


  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (isParcLoading) {
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
      <Link href="/immeuble?fuites=1" className="h-full">
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
              {formatNumber(metrics.fuites)}
            </h4>
          </div>
        </div>
        <div className="mt-5 h-[33px]"></div>
        </div>
      </Link>
      {/* Fuites - Metric Item End */}

      {/* Alarmes (Dysfonctionnements) - Metric Item Start */}
      <Link href="/immeuble?dysfonctionnements=1" className="h-full">
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
              {formatNumber(metrics.alarmes)}
            </h4>
          </div>
        </div>
        <div className="mt-5 h-[33px]"></div>
        </div>
      </Link>
      {/* Alarmes - Metric Item End */}

      {/* Anomalies - Metric Item Start */}
      <Link href="/immeuble?anomalies=1" className="h-full">
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
              {formatNumber(metrics.anomalies)}
            </h4>
          </div>
        </div>
        <div className="mt-5 h-[33px]"></div>
        </div>
      </Link>
      {/* Anomalies - Metric Item End */}

      {/* Depannages - Metric Item Start */}
      <Link href="/immeuble?depannages=1" className="h-full">
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
              {formatNumber(metrics.depannages)}
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
          <DatePicker
            selected={startDate}
            onChange={(d: Date | null) => setStartDate(d)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={endDate ?? undefined}
            dateFormat="dd/MM/yyyy"
            locale={fr}
            placeholderText="JJ/MM/AAAA"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-[#1d1914] mb-2 block">
            Date de fin
          </label>
          <DatePicker
            selected={endDate}
            onChange={(d: Date | null) => setEndDate(d)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ?? undefined}
            dateFormat="dd/MM/yyyy"
            locale={fr}
            placeholderText="JJ/MM/AAAA"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
          />
        </div>
      </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSyntheseExport}
            disabled={isSyntheseExporting || !isRangeValid}
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
            disabled={isDetailPdfExporting || !isRangeValid}
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
            disabled={isDetailExcelExporting || !isRangeValid}
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

