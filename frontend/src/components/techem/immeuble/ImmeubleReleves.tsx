"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import { FaFaucet, FaFire, FaChartBar, FaBolt } from "react-icons/fa";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { useExport } from "@/lib/hooks/useExport";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
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

interface ReleveOption {
  pkReleve: number;
  dateReleve: string;
  formattedDate: string;
}

export default function ImmeubleReleves({
  pkImmeuble,
  selectedTab: controlledTab,
  onTabChange,
}: ImmeubleRelevesProps) {
  const { useImmeubleQuery, getReport, exportReleveExcel } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = useImmeubleQuery(pkImmeuble);
  const [uncontrolledTab, setUncontrolledTab] = useState<TabType>("eauFroide");
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [selectedPkReleve, setSelectedPkReleve] = useState<number | null>(null);

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

  // Format date from ISO string to French format (DD/MM/YYYY)
  const formatDateToFrench = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }, []);

  // Extract ListeReleves data based on selected tab
  const relevesOptions = useMemo<ReleveOption[]>(() => {
    const immeuble = immeubleData?.immeuble;
    if (!immeuble) return [];

    let listeReleves: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } | null = null;

    if (selectedTab === "eauFroide") {
      const immeubleEF = (immeuble && typeof immeuble === 'object' && 'ImmeubleEF' in immeuble)
        ? (immeuble as { ImmeubleEF?: Record<string, unknown> }).ImmeubleEF
        : null;
      listeReleves = (immeubleEF && typeof immeubleEF === 'object' && 'ListeReleves' in immeubleEF)
        ? (immeubleEF as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
        : null;
    } else if (selectedTab === "eauChaude") {
      const immeubleEC = (immeuble && typeof immeuble === 'object' && 'ImmeubleEC' in immeuble)
        ? (immeuble as { ImmeubleEC?: Record<string, unknown> }).ImmeubleEC
        : null;
      listeReleves = (immeubleEC && typeof immeubleEC === 'object' && 'ListeReleves' in immeubleEC)
        ? (immeubleEC as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
        : null;
    }

    if (!listeReleves?.releve || !Array.isArray(listeReleves.releve)) {
      return [];
    }

    return listeReleves.releve
      .filter((releve) => releve.PkReleve && releve.DateReleve)
      .map((releve) => ({
        pkReleve: releve.PkReleve!,
        dateReleve: releve.DateReleve!,
        formattedDate: formatDateToFrench(releve.DateReleve!),
      }))
      .sort((a, b) => new Date(b.dateReleve).getTime() - new Date(a.dateReleve).getTime()); // Sort by date descending (newest first)
  }, [immeubleData, selectedTab, formatDateToFrench]);

  // Check if Excel export is available for current tab
  const isExcelExportAvailable = selectedTab === "eauFroide" || selectedTab === "eauChaude";

  // Handle opening Excel export modal
  const handleExportExcelClick = useCallback(() => {
    if (relevesOptions.length === 0) {
      // If no releves available, show error or disable button
      return;
    }
    setSelectedPkReleve(null);
    openModal();
  }, [relevesOptions, openModal]);

  // Handle Excel export with selected PkReleve
  const handleExportExcel = useCallback(async () => {
    if (!selectedPkReleve) {
      throw new Error("Veuillez sélectionner une date de relevé.");
    }
    await exportReleveExcel(pkImmeuble, selectedPkReleve);
    // Close modal only on success (if error, useExport will handle it and modal stays open)
    closeModal();
    setSelectedPkReleve(null);
  }, [selectedPkReleve, exportReleveExcel, pkImmeuble, closeModal]);

  // Use the reusable export hooks
  const { 
    handleExport: handleExportPdfClick, 
    isExporting: isExportingPdf, 
    error: exportPdfError, 
    clearError: clearExportPdfError 
  } = useExport(handleExportPdf, { errorTitle: "Erreur d'export PDF" });

  const { 
    handleExport: handleExportExcelConfirm, 
    isExporting: isExportingExcel, 
    error: exportExcelError, 
    clearError: clearExportExcelError 
  } = useExport(handleExportExcel, { errorTitle: "Erreur d'export Excel" });

  // Handle modal validation
  const handleModalValidate = useCallback(() => {
    if (!selectedPkReleve) {
      return;
    }
    handleExportExcelConfirm();
  }, [selectedPkReleve, handleExportExcelConfirm]);

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

  // Get color for current tab
  const getTabColor = (tab: TabType): string => {
    switch (tab) {
      case "eauFroide":
        return "#009bb4"; // Techem blue
      case "eauChaude":
        return "#e20613"; // Techem red
      case "repartiteur":
        return "#6a6a6a"; // Techem gray
      case "compteurEnergie":
        return "#417232"; // Techem green
    }
  };

  const currentTabColor = getTabColor(selectedTab);

  // Chart options
  const chartOptions: ApexOptions = useMemo(() => ({
    colors: [currentTabColor],
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
      colors: [currentTabColor],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  }), [currentTabColor]);

  const series = [currentData.percentage];

  const getButtonClass = (tab: TabType) => {
    const baseClasses = "px-3 py-2 font-normal w-full rounded-md text-sm transition-all duration-300 flex items-center justify-center gap-2";
    const isActive = selectedTab === tab;
    
    if (isActive) {
      return `${baseClasses} shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] text-[#1d1914] bg-white border-2 border-[#1d1914]`;
    }
    
    return `${baseClasses} text-[#1d1914] hover:text-[#e20613] hover:bg-[#ffe5e6]`;
  };

  // Get icon and color for each tab
  const getTabConfig = (tab: TabType) => {
    switch (tab) {
      case "eauFroide":
        return {
          icon: <FaFaucet className="w-4 h-4" />,
          color: "text-[#009bb4]",
        };
      case "eauChaude":
        return {
          icon: <FaFire className="w-4 h-4" />,
          color: "text-[#e20613]",
        };
      case "repartiteur":
        return {
          icon: <FaChartBar className="w-4 h-4" />,
          color: "text-[#6a6a6a]",
        };
      case "compteurEnergie":
        return {
          icon: <FaBolt className="w-4 h-4" />,
          color: "text-[#417232]",
        };
    }
  };

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
    <div className="rounded-xl border border-[#1d1914] bg-[#e9ecef] shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <div className="px-5 pt-5 bg-white rounded-xl pb-11 sm:px-6 sm:pt-6">
        {(exportPdfError || exportExcelError) && (
          <div className="mb-4">
            <div className="p-4 bg-[#b00511] text-white rounded-lg">
              <p className="font-medium mb-1">{(exportPdfError || exportExcelError)?.title || "Erreur"}</p>
              <p className="text-sm">{(exportPdfError || exportExcelError)?.message || ""}</p>
            </div>
            <button
              onClick={() => {
                if (exportPdfError) clearExportPdfError();
                if (exportExcelError) clearExportExcelError();
              }}
              className="mt-2 text-sm text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
            >
              Fermer
            </button>
          </div>
        )}
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-xl font-normal text-[#1d1914]">
              Relevés
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcelClick}
              disabled={!isExcelExportAvailable || relevesOptions.length === 0 || isExportingExcel || isImmeubleLoading}
              className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
                !isExcelExportAvailable || relevesOptions.length === 0 || isExportingExcel || isImmeubleLoading
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
              onClick={handleExportPdfClick}
              disabled={isExportingPdf || isImmeubleLoading}
              className={`inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-4 py-2.5 text-sm font-normal transition-all duration-300 ${
                isExportingPdf || isImmeubleLoading
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

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg bg-[#e9ecef] p-0.5 mb-6">
          <button
            onClick={() => handleTabChange("eauFroide")}
            className={getButtonClass("eauFroide")}
          >
            <span className={selectedTab === "eauFroide" ? "text-[#009bb4]" : "text-[#1d1914]"}>
              {getTabConfig("eauFroide").icon}
            </span>
            <span>Eau froide</span>
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={getButtonClass("eauChaude")}
          >
            <span className={selectedTab === "eauChaude" ? "text-[#e20613]" : "text-[#1d1914]"}>
              {getTabConfig("eauChaude").icon}
            </span>
            <span>Eau chaude</span>
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={getButtonClass("repartiteur")}
          >
            <span className={selectedTab === "repartiteur" ? "text-[#6a6a6a]" : "text-[#1d1914]"}>
              {getTabConfig("repartiteur").icon}
            </span>
            <span>Répartiteur</span>
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={getButtonClass("compteurEnergie")}
          >
            <span className={selectedTab === "compteurEnergie" ? "text-[#417232]" : "text-[#1d1914]"}>
              {getTabConfig("compteurEnergie").icon}
            </span>
            <span>Compteur d&apos;énergie</span>
          </button>
        </div>

        {/* Chart and Tables for all tabs */}
        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              key={selectedTab}
              options={chartOptions}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-[#1d1914] sm:text-base">
          des appareils relevés
        </p>

        {/* Consumption Tables */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Table: Les 5 plus fortes consommations */}
          <div>
            <h4 className="mb-4 text-xl font-normal text-[#1d1914]">
              Les 5 plus fortes consommations
            </h4>
            {currentData.consosGrandes.length > 0 ? (
              <Table>
                <TableHeader className="border-y border-[#1d1914]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Réf client
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Occupant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Conso
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[#1d1914]">
                  {currentData.consosGrandes.map((conso, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.RefOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.NomOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.Conso ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-xl border border-dashed border-[#1d1914] p-4">
                <p className="text-center text-base text-[#1d1914]">
                  Aucune donnée disponible
                </p>
              </div>
            )}
          </div>

          {/* Table: Les 5 plus faibles consommations */}
          <div>
            <h4 className="mb-4 text-xl font-normal text-[#1d1914]">
              Les 5 plus faibles consommations
            </h4>
            {currentData.consosPetites.length > 0 ? (
              <Table>
                <TableHeader className="border-y border-[#1d1914]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Réf client
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Occupant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 text-start text-sm font-normal text-[#1d1914]"
                    >
                      Conso
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[#1d1914]">
                  {currentData.consosPetites.map((conso, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.RefOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.NomOcc ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#1d1914]">
                        {conso.Conso ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-xl border border-dashed border-[#1d1914] p-4">
                <p className="text-center text-base text-[#1d1914]">
                  Aucune donnée disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="w-px bg-[#1d1914] h-7"></div>
        <div className="w-px bg-[#1d1914] h-7"></div>
      </div>

      {/* Modal for Excel export date selection */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="max-w-[500px] p-6 lg:p-8"
      >
        <h4 className="text-xl font-normal text-[#1d1914] mb-6 text-center">
          Sélectionner une date
        </h4>
        
        {relevesOptions.length === 0 ? (
          <p className="text-sm text-[#1d1914] mb-6">
            Aucun relevé disponible pour cet onglet.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-normal text-[#1d1914] mb-2">
                Date de relevé
              </label>
              <div className="max-h-[300px] overflow-y-auto border border-[#1d1914] rounded-lg">
                {relevesOptions.map((option) => (
                  <button
                    key={option.pkReleve}
                    onClick={() => setSelectedPkReleve(option.pkReleve)}
                    className={`w-full px-4 py-3 text-left text-sm transition-all duration-300 border-b border-[#1d1914] last:border-b-0 ${
                      selectedPkReleve === option.pkReleve
                        ? "bg-[#ffe5e6] text-[#1d1914]"
                        : "text-[#1d1914] hover:bg-[#ffe5e6]"
                    }`}
                  >
                    {option.formattedDate}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-normal text-[#1d1914] bg-white border border-[#1d1914] rounded-lg transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613]"
              >
                Annuler
              </button>
              <button
                onClick={handleModalValidate}
                disabled={!selectedPkReleve || isExportingExcel}
                className={`px-4 py-2 text-sm font-normal text-white rounded-lg transition-all duration-300 ${
                  !selectedPkReleve || isExportingExcel
                    ? "bg-[#6a6a6a] cursor-not-allowed"
                    : "bg-[#1d1914] hover:bg-[#e20613]"
                }`}
              >
                {isExportingExcel ? "Export en cours..." : "Valider"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

