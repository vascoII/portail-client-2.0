"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { useExport } from "@/lib/hooks/useExport";
import Alert from "@/components/ui/alert/Alert";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { LoadingChart } from "@/components/ui/loading";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ImmeubleRelevesProps {
  pkImmeuble: string;
  selectedTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export type TabType =
  | "eauFroide"
  | "eauChaude"
  | "repartiteur"
  | "compteurEnergie";

export default function ImmeubleReleves({
  pkImmeuble,
  selectedTab: controlledTab,
  onTabChange,
}: ImmeubleRelevesProps) {
  const { getImmeubleQuery, getReport } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = getImmeubleQuery(pkImmeuble);
  const [uncontrolledTab, setUncontrolledTab] = useState<TabType>("eauFroide");

  const selectedTab = controlledTab ?? uncontrolledTab;

  const handleTabChange = (tab: TabType) => {
    if (controlledTab === undefined) {
      setUncontrolledTab(tab);
    }
    onTabChange?.(tab);
  };

  // Create wrapper function for PDF export based on selected tab
  const handleExportPdf = useCallback(async () => {
    // Map tab types to API parameters
    const tabToParams: Record<TabType, { type: string | null; energie: string }> = {
      eauFroide: { type: null, energie: "EAU" },
      eauChaude: { type: null, energie: "EAU" },
      repartiteur: { type: "repartition", energie: "CHAUFFAGE" },
      compteurEnergie: { type: null, energie: "CHAUFFAGE" },
    };

    const params = tabToParams[selectedTab];
    await getReport(pkImmeuble, params);
  }, [getReport, pkImmeuble, selectedTab]);

  // Create wrapper function for Excel export based on selected tab
  // TODO: Implement Excel export function when available
  const handleExportExcel = useCallback(async () => {
    // For now, throw an error indicating Excel export is not yet implemented
    // This can be replaced with actual Excel export function when available
    throw new Error("L'export Excel des relevés n'est pas encore disponible.");
  }, []);

  // Use the reusable export hooks
  const { 
    handleExport: handleExportPdfClick, 
    isExporting: isExportingPdf, 
    error: exportPdfError, 
    clearError: clearExportPdfError 
  } = useExport(handleExportPdf, { errorTitle: "Erreur d'export PDF" });

  const { 
    handleExport: handleExportExcelClick, 
    isExporting: isExportingExcel, 
    error: exportExcelError, 
    clearError: clearExportExcelError 
  } = useExport(handleExportExcel, { errorTitle: "Erreur d'export Excel" });

  // Extract data from API response
  const relevesData = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    
    // Debug: log the structure to understand the data format
    if (process.env.NODE_ENV === 'development') {
      console.log('Immeuble data structure:', immeuble);
      console.log('ImmeubleRepart:', (immeuble as Record<string, unknown>)?.ImmeubleRepart);
      console.log('ImmeubleCET:', (immeuble as Record<string, unknown>)?.ImmeubleCET);
      console.log('Has ImmeubleRepart:', 'ImmeubleRepart' in (immeuble || {}));
      console.log('Has ImmeubleCET:', 'ImmeubleCET' in (immeuble || {}));
      if ((immeuble as Record<string, unknown>)?.ImmeubleRepart) {
        const repart = (immeuble as Record<string, unknown>).ImmeubleRepart as Record<string, unknown>;
        console.log('ImmeubleRepart.NbCompteursReleves:', repart?.NbCompteursReleves);
        console.log('ImmeubleRepart.NbCompteursARelever:', repart?.NbCompteursARelever);
      }
      if ((immeuble as Record<string, unknown>)?.ImmeubleCET) {
        const cet = (immeuble as Record<string, unknown>).ImmeubleCET as Record<string, unknown>;
        console.log('ImmeubleCET.NbCompteursReleves:', cet?.NbCompteursReleves);
        console.log('ImmeubleCET.NbCompteursARelever:', cet?.NbCompteursARelever);
      }
    }
    
    // Handle both nested and direct properties
    const immeubleEF = (immeuble && typeof immeuble === 'object' && 'ImmeubleEF' in immeuble)
      ? (immeuble as { ImmeubleEF?: Record<string, unknown> }).ImmeubleEF
      : null;
    
    const immeubleEC = (immeuble && typeof immeuble === 'object' && 'ImmeubleEC' in immeuble)
      ? (immeuble as { ImmeubleEC?: Record<string, unknown> }).ImmeubleEC
      : null;

    // Calculate percentage for Eau Froide
    const nbCompteursEFRelevesRaw = immeubleEF?.NbCompteursReleves ?? immeubleEF?.nbCompteursReleves ?? 0;
    const nbCompteursEFAReleverRaw = immeubleEF?.NbCompteursARelever ?? immeubleEF?.nbCompteursARelever ?? 0;
    const nbCompteursEFReleves = typeof nbCompteursEFRelevesRaw === 'number' ? nbCompteursEFRelevesRaw : Number(nbCompteursEFRelevesRaw) || 0;
    const nbCompteursEFARelever = typeof nbCompteursEFAReleverRaw === 'number' ? nbCompteursEFAReleverRaw : Number(nbCompteursEFAReleverRaw) || 0;
    const pcEauFroide = nbCompteursEFARelever > 0 
      ? Math.round((nbCompteursEFReleves / nbCompteursEFARelever) * 100) 
      : 0;

    // Calculate percentage for Eau Chaude
    const nbCompteursECRelevesRaw = immeubleEC?.NbCompteursReleves ?? immeubleEC?.nbCompteursReleves ?? 0;
    const nbCompteursECAReleverRaw = immeubleEC?.NbCompteursARelever ?? immeubleEC?.nbCompteursARelever ?? 0;
    const nbCompteursECReleves = typeof nbCompteursECRelevesRaw === 'number' ? nbCompteursECRelevesRaw : Number(nbCompteursECRelevesRaw) || 0;
    const nbCompteursECARelever = typeof nbCompteursECAReleverRaw === 'number' ? nbCompteursECAReleverRaw : Number(nbCompteursECAReleverRaw) || 0;
    const pcEauChaude = nbCompteursECARelever > 0 
      ? Math.round((nbCompteursECReleves / nbCompteursECARelever) * 100) 
      : 0;

    // Extract TopConsos data for Eau Froide
    const topConsosEF = (immeubleEF && typeof immeubleEF === 'object' && 'TopConsos' in immeubleEF)
      ? (immeubleEF as { TopConsos?: Record<string, unknown> }).TopConsos
      : null;
    
    const consosGrandesEF = (topConsosEF && typeof topConsosEF === 'object' && 'consosGrandes' in topConsosEF)
      ? (topConsosEF.consosGrandes as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];
    
    const consosPetitesEF = (topConsosEF && typeof topConsosEF === 'object' && 'consosPetites' in topConsosEF)
      ? (topConsosEF.consosPetites as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];

    // Extract TopConsos data for Eau Chaude
    const topConsosEC = (immeubleEC && typeof immeubleEC === 'object' && 'TopConsos' in immeubleEC)
      ? (immeubleEC as { TopConsos?: Record<string, unknown> }).TopConsos
      : null;
    
    const consosGrandesEC = (topConsosEC && typeof topConsosEC === 'object' && 'consosGrandes' in topConsosEC)
      ? (topConsosEC.consosGrandes as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];
    
    const consosPetitesEC = (topConsosEC && typeof topConsosEC === 'object' && 'consosPetites' in topConsosEC)
      ? (topConsosEC.consosPetites as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];

    // Handle both nested and direct properties for Répartiteur
    const immeubleRepart = (immeuble && typeof immeuble === 'object' && 'ImmeubleRepart' in immeuble)
      ? (immeuble as { ImmeubleRepart?: Record<string, unknown> }).ImmeubleRepart
      : null;

    // Calculate percentage for Répartiteur
    const nbCompteursRepartRelevesRaw = immeubleRepart?.NbCompteursReleves ?? immeubleRepart?.nbCompteursReleves ?? 0;
    const nbCompteursRepartAReleverRaw = immeubleRepart?.NbCompteursARelever ?? immeubleRepart?.nbCompteursARelever ?? 0;
    const nbCompteursRepartReleves = typeof nbCompteursRepartRelevesRaw === 'number' ? nbCompteursRepartRelevesRaw : Number(nbCompteursRepartRelevesRaw) || 0;
    const nbCompteursRepartARelever = typeof nbCompteursRepartAReleverRaw === 'number' ? nbCompteursRepartAReleverRaw : Number(nbCompteursRepartAReleverRaw) || 0;
    const pcRepartiteur = nbCompteursRepartARelever > 0 
      ? Math.round((nbCompteursRepartReleves / nbCompteursRepartARelever) * 100) 
      : 0;

    // Extract TopConsos data for Répartiteur
    const topConsosRepart = (immeubleRepart && typeof immeubleRepart === 'object' && 'TopConsos' in immeubleRepart)
      ? (immeubleRepart as { TopConsos?: Record<string, unknown> }).TopConsos
      : null;
    
    const consosGrandesRepart = (topConsosRepart && typeof topConsosRepart === 'object' && 'consosGrandes' in topConsosRepart)
      ? (topConsosRepart.consosGrandes as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];
    
    const consosPetitesRepart = (topConsosRepart && typeof topConsosRepart === 'object' && 'consosPetites' in topConsosRepart)
      ? (topConsosRepart.consosPetites as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];

    // Handle both nested and direct properties for Compteur d'énergie
    const immeubleCET = (immeuble && typeof immeuble === 'object' && 'ImmeubleCET' in immeuble)
      ? (immeuble as { ImmeubleCET?: Record<string, unknown> }).ImmeubleCET
      : null;

    // Calculate percentage for Compteur d'énergie
    const nbCompteursCETRelevesRaw = immeubleCET?.NbCompteursReleves ?? immeubleCET?.nbCompteursReleves ?? 0;
    const nbCompteursCETAReleverRaw = immeubleCET?.NbCompteursARelever ?? immeubleCET?.nbCompteursARelever ?? 0;
    const nbCompteursCETReleves = typeof nbCompteursCETRelevesRaw === 'number' ? nbCompteursCETRelevesRaw : Number(nbCompteursCETRelevesRaw) || 0;
    const nbCompteursCETARelever = typeof nbCompteursCETAReleverRaw === 'number' ? nbCompteursCETAReleverRaw : Number(nbCompteursCETAReleverRaw) || 0;
    const pcCompteurEnergie = nbCompteursCETARelever > 0 
      ? Math.round((nbCompteursCETReleves / nbCompteursCETARelever) * 100) 
      : 0;

    // Extract TopConsos data for Compteur d'énergie
    const topConsosCET = (immeubleCET && typeof immeubleCET === 'object' && 'TopConsos' in immeubleCET)
      ? (immeubleCET as { TopConsos?: Record<string, unknown> }).TopConsos
      : null;
    
    const consosGrandesCET = (topConsosCET && typeof topConsosCET === 'object' && 'consosGrandes' in topConsosCET)
      ? (topConsosCET.consosGrandes as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];
    
    const consosPetitesCET = (topConsosCET && typeof topConsosCET === 'object' && 'consosPetites' in topConsosCET)
      ? (topConsosCET.consosPetites as { conso?: Array<{ RefOcc?: string; NomOcc?: string; Conso?: string }> })?.conso ?? []
      : [];

    return {
      eauFroide: {
        percentage: pcEauFroide,
        releves: nbCompteursEFReleves,
        aRelever: nbCompteursEFARelever,
        consosGrandes: Array.isArray(consosGrandesEF) ? consosGrandesEF.slice(0, 5) : [], // Limit to 5 items
        consosPetites: Array.isArray(consosPetitesEF) ? consosPetitesEF.slice(0, 5) : [], // Limit to 5 items
      },
      eauChaude: {
        percentage: pcEauChaude,
        releves: nbCompteursECReleves,
        aRelever: nbCompteursECARelever,
        consosGrandes: Array.isArray(consosGrandesEC) ? consosGrandesEC.slice(0, 5) : [],
        consosPetites: Array.isArray(consosPetitesEC) ? consosPetitesEC.slice(0, 5) : [], // Limit to 5 items
      },
      repartiteur: {
        percentage: pcRepartiteur,
        releves: nbCompteursRepartReleves,
        aRelever: nbCompteursRepartARelever,
        consosGrandes: consosGrandesRepart.slice(0, 5), // Limit to 5 items
        consosPetites: consosPetitesRepart.slice(0, 5), // Limit to 5 items
      },
      compteurEnergie: {
        percentage: pcCompteurEnergie,
        releves: nbCompteursCETReleves,
        aRelever: nbCompteursCETARelever,
        consosGrandes: consosGrandesCET.slice(0, 5), // Limit to 5 items
        consosPetites: consosPetitesCET.slice(0, 5), // Limit to 5 items
      },
    };
  }, [immeubleData]);

  // Get current tab data
  const currentData = relevesData[selectedTab];

  // Chart options
  const chartOptions: ApexOptions = useMemo(() => ({
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  }), []);

  const series = [currentData.percentage];

  const getButtonClass = (tab: TabType) =>
    selectedTab === tab
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  // Show loading state while fetching data
  if (isImmeubleLoading) {
    return (
      <LoadingChart 
        height={330} 
        message="Chargement des données..." 
        variant="radial"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        {(exportPdfError || exportExcelError) && (
          <div className="mb-4">
            <Alert
              variant={(exportPdfError || exportExcelError)?.variant || "error"}
              title={(exportPdfError || exportExcelError)?.title || "Erreur"}
              message={(exportPdfError || exportExcelError)?.message || ""}
              showLink={false}
            />
            <button
              onClick={() => {
                if (exportPdfError) clearExportPdfError();
                if (exportExcelError) clearExportExcelError();
              }}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Fermer
            </button>
          </div>
        )}
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Relevés
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcelClick}
              disabled={isExportingExcel || isImmeubleLoading}
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
              onClick={handleExportPdfClick}
              disabled={isExportingPdf || isImmeubleLoading}
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

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 mb-6">
          <button
            onClick={() => handleTabChange("eauFroide")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "eauFroide"
            )}`}
          >
            Eau froide
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "eauChaude"
            )}`}
          >
            Eau chaude
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "repartiteur"
            )}`}
          >
            Répartiteur
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "compteurEnergie"
            )}`}
          >
            Compteur d&apos;énergie
          </button>
        </div>

        {/* Chart and Tables for all tabs */}
        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          des appareils relevés
        </p>

        {/* Consumption Tables */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Table: Les 5 plus fortes consommations */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
              Les 5 plus fortes consommations
            </h4>
            {currentData.consosGrandes.length > 0 ? (
              <Table>
                <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Réf client
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Occupant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Conso
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentData.consosGrandes.map((conso, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.RefOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.NomOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.Conso ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-800">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </p>
              </div>
            )}
          </div>

          {/* Table: Les 5 plus faibles consommations */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
              Les 5 plus faibles consommations
            </h4>
            {currentData.consosPetites.length > 0 ? (
              <Table>
                <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Réf client
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Occupant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      Conso
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentData.consosPetites.map((conso, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.RefOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.NomOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-800 dark:text-white/90">
                        {conso.Conso ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-800">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}

