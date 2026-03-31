"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import { FaFaucet, FaFire, FaChartBar, FaBolt } from "react-icons/fa";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { useExport } from "@/lib/hooks/useExport";
import { useModal } from "@/hooks/useModal";
import { api, handleApiError } from "@/lib/api/client";
import Alert from "@/components/ui/alert/Alert";
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

type ImmeubleRepartDisplayStats = {
  totURepart: string;
  totTantChauff: string;
  puTant: string;
  prixURepart: string;
  prixAbonn: string;
  montARepartTant: string;
  partRepartConsos: string;
  ctCombust: string;
  tantLog: string;
  ctChauffLog: string;
};

/** Champs ImmeubleRepart : Tot_URepart, PU_Tant, etc. (cf. immeuble.json) */
function parseImmeubleRepartStats(
  immeubleRepart: Record<string, unknown> | null | undefined
): ImmeubleRepartDisplayStats | null {
  if (!immeubleRepart || typeof immeubleRepart !== "object") {
    return null;
  }

  const toNumber = (value: unknown): number | null => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
      const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const totU = toNumber(immeubleRepart.Tot_URepart);
  if (totU === null || totU < 0) {
    return null;
  }

  const formatInteger = (value: unknown) => {
    const numeric = toNumber(value);
    if (numeric === null) return "—";
    return Math.round(numeric).toLocaleString("fr-FR");
  };

  const formatEuro = (value: unknown, decimals = 2) => {
    const numeric = toNumber(value);
    if (numeric === null) return "—";
    return `${numeric.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} €`;
  };

  const formatEuroUnit = (value: unknown, decimals = 5) => formatEuro(value, decimals);

  return {
    totURepart: formatInteger(immeubleRepart.Tot_URepart),
    totTantChauff: formatInteger(immeubleRepart.Tot_TantChauff),
    puTant: formatEuroUnit(immeubleRepart.PU_Tant),
    prixURepart: formatEuroUnit(immeubleRepart.Prix_URepart),
    prixAbonn: formatEuro(immeubleRepart.Prix_Abonn, 2),
    montARepartTant: formatEuro(immeubleRepart.Mont_ARepartTant, 2),
    partRepartConsos: formatEuro(immeubleRepart.Part_RepartConsos, 2),
    ctCombust: formatEuro(immeubleRepart.CT_Combust, 2),
    tantLog: formatInteger(immeubleRepart.TantLog),
    ctChauffLog: formatEuro(immeubleRepart.CT_ChauffLog, 2),
  };
}

export default function ImmeubleReleves({
  pkImmeuble,
  selectedTab: controlledTab,
  onTabChange,
}: ImmeubleRelevesProps) {
  const { useImmeubleQuery, exportImmeubleRelevePdf, exportImmeubleReleveExcel } = useImmeubles();
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

  // Create wrapper function for PDF export based on selected tab and pkReleve
  const handleExportPdf = useCallback(
    async (pkReleve: number | null) => {
      if (!pkReleve) {
        throw new Error("Veuillez sélectionner une date de relevé.");
      }

      let energieSegment: string;
      if (selectedTab === "eauFroide" || selectedTab === "eauChaude") {
        energieSegment = "eau";
      } else if (selectedTab === "repartiteur") {
        energieSegment = "repart";
      } else {
        // compteurEnergie
        energieSegment = "cet";
      }

      await exportImmeubleRelevePdf(pkImmeuble, energieSegment, pkReleve);
    },
    [pkImmeuble, selectedTab, exportImmeubleRelevePdf]
  );

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
      const immeubleEF = (immeuble && typeof immeuble === "object" && "ImmeubleEF" in immeuble)
        ? (immeuble as { ImmeubleEF?: Record<string, unknown> }).ImmeubleEF
        : null;
      listeReleves = (immeubleEF && typeof immeubleEF === "object" && "ListeReleves" in immeubleEF)
        ? (immeubleEF as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
        : null;
    } else if (selectedTab === "eauChaude") {
      const immeubleEC = (immeuble && typeof immeuble === "object" && "ImmeubleEC" in immeuble)
        ? (immeuble as { ImmeubleEC?: Record<string, unknown> }).ImmeubleEC
        : null;
      listeReleves = (immeubleEC && typeof immeubleEC === "object" && "ListeReleves" in immeubleEC)
        ? (immeubleEC as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
        : null;
    } else if (selectedTab === "repartiteur") {
      const immeubleRepart = (immeuble && typeof immeuble === "object" && "ImmeubleRepart" in immeuble)
        ? (immeuble as { ImmeubleRepart?: Record<string, unknown> }).ImmeubleRepart
        : null;
      listeReleves = (immeubleRepart && typeof immeubleRepart === "object" && "ListeReleves" in immeubleRepart)
        ? (immeubleRepart as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
        : null;
    } else if (selectedTab === "compteurEnergie") {
      const immeubleCET = (immeuble && typeof immeuble === "object" && "ImmeubleCET" in immeuble)
        ? (immeuble as { ImmeubleCET?: Record<string, unknown> }).ImmeubleCET
        : null;
      listeReleves = (immeubleCET && typeof immeubleCET === "object" && "ListeReleves" in immeubleCET)
        ? (immeubleCET as { ListeReleves?: { releve?: Array<{ PkReleve?: number; DateReleve?: string }> } }).ListeReleves ?? null
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

  const immeubleRepartStats = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    if (!immeuble || typeof immeuble !== "object" || !("ImmeubleRepart" in immeuble)) {
      return null;
    }
    const repart = (immeuble as { ImmeubleRepart?: Record<string, unknown> }).ImmeubleRepart;
    return parseImmeubleRepartStats(repart);
  }, [immeubleData]);

  const latestRepartPkReleve = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    if (!immeuble || typeof immeuble !== "object" || !("ImmeubleRepart" in immeuble)) {
      return null;
    }
    const repart = (immeuble as { ImmeubleRepart?: Record<string, unknown> }).ImmeubleRepart;
    if (!repart || typeof repart !== "object" || !("ListeReleves" in repart)) {
      return null;
    }
    const liste = repart.ListeReleves as
      | { releve?: Array<{ PkReleve?: number; DateReleve?: string }> }
      | undefined;
    const releves = liste?.releve;
    if (!Array.isArray(releves) || releves.length === 0) {
      return null;
    }
    const sorted = [...releves]
      .filter((r) => r.PkReleve && r.DateReleve)
      .sort((a, b) => new Date(b.DateReleve!).getTime() - new Date(a.DateReleve!).getTime());
    return sorted[0]?.PkReleve ?? null;
  }, [immeubleData]);

  // Handle opening export modal
  const handleExportExcelClick = useCallback(() => {
    if (relevesOptions.length === 0) {
      // If no releves available, show error or disable button
      return;
    }
    setSelectedPkReleve(null);
    openModal();
  }, [relevesOptions, openModal]);

  // Handle Excel export with selected PkReleve and selected tab
  const handleExportExcel = useCallback(async () => {
    if (!selectedPkReleve) {
      throw new Error("Veuillez sélectionner une date de relevé.");
    }

    let energieSegment: string;
    if (selectedTab === "eauFroide" || selectedTab === "eauChaude") {
      energieSegment = "eau";
    } else if (selectedTab === "repartiteur") {
      energieSegment = "repart";
    } else {
      // compteurEnergie
      energieSegment = "rcet";
    }

    await exportImmeubleReleveExcel(pkImmeuble, energieSegment, selectedPkReleve);

    // Close modal only on success (if error, useExport will handle it and modal stays open)
    closeModal();
    setSelectedPkReleve(null);
  }, [selectedPkReleve, pkImmeuble, closeModal, selectedTab, exportImmeubleReleveExcel]);

  // Use the reusable export hooks
  const {
    handleExport: handleExportPdfWithPk,
    isExporting: isExportingPdf,
    error: exportPdfError,
    clearError: clearExportPdfError,
  } = useExport(
    () => handleExportPdf(selectedPkReleve),
    { errorTitle: "Erreur d'export PDF" }
  );

  const { 
    handleExport: handleExportExcelConfirm, 
    isExporting: isExportingExcel, 
    error: exportExcelError, 
    clearError: clearExportExcelError 
  } = useExport(handleExportExcel, { errorTitle: "Erreur d'export Excel" });

  const downloadNoteMensuelle = useCallback(async () => {
    if (!latestRepartPkReleve) {
      throw new Error("Aucun relevé répartiteur disponible pour cet export.");
    }
    try {
      const response = await api.get(`/immeubles/${pkImmeuble}/releve_pdf/NOTE/CHAUFFAGE`, {
        params: { pkReleve: latestRepartPkReleve },
        responseType: "blob",
      });
      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `immeuble-${pkImmeuble}-note-mensuelle-${latestRepartPkReleve}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = handleApiError(err);
      throw new Error(message || "Erreur lors de l'export de la note mensuelle.");
    }
  }, [pkImmeuble, latestRepartPkReleve]);

  const downloadDonneesRepartition = useCallback(async () => {
    if (!latestRepartPkReleve) {
      throw new Error("Aucun relevé répartiteur disponible pour cet export.");
    }
    try {
      const response = await api.get(`/immeubles/${pkImmeuble}/releve_pdf/repartition/REPART`, {
        params: { pkReleve: latestRepartPkReleve },
        responseType: "blob",
      });
      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `immeuble-${pkImmeuble}-repartition-${latestRepartPkReleve}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = handleApiError(err);
      throw new Error(message || "Erreur lors de l'export des données de répartition.");
    }
  }, [pkImmeuble, latestRepartPkReleve]);

  const {
    handleExport: handleExportNoteMensuelle,
    isExporting: isExportingNoteMensuelle,
    error: noteMensuelleError,
    clearError: clearNoteMensuelleError,
  } = useExport(downloadNoteMensuelle, { errorTitle: "Erreur export note mensuelle" });

  const {
    handleExport: handleExportDonneesRepartition,
    isExporting: isExportingDonneesRepartition,
    error: donneesRepartitionError,
    clearError: clearDonneesRepartitionError,
  } = useExport(downloadDonneesRepartition, { errorTitle: "Erreur export données répartition" });

  // Handle modal validation
  const handleModalExportPdf = useCallback(() => {
    if (!selectedPkReleve) {
      return;
    }
    handleExportPdfWithPk();
  }, [selectedPkReleve, handleExportPdfWithPk]);

  const handleModalExportExcel = useCallback(() => {
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
        return "#2563EB"; // blue-600
      case "eauChaude":
        return "#EA580C"; // orange-600
      case "repartiteur":
        return "#9333EA"; // purple-600
      case "compteurEnergie":
        return "#16A34A"; // green-600
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

  const showRepartLogementSection =
    immeubleRepartStats !== null &&
    (immeubleRepartStats.tantLog !== "—" || immeubleRepartStats.ctChauffLog !== "—");

  const getButtonClass = (tab: TabType) => {
    const baseClasses = "px-3 py-2 font-medium w-full rounded-md text-theme-sm transition-all duration-200 flex items-center justify-center gap-2";
    const isActive = selectedTab === tab;
    
    if (isActive) {
      return `${baseClasses} shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400`;
    }
    
    return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50`;
  };

  // Get icon and color for each tab
  const getTabConfig = (tab: TabType) => {
    switch (tab) {
      case "eauFroide":
        return {
          icon: <FaFaucet className="w-4 h-4" />,
          color: "text-blue-600 dark:text-blue-400",
        };
      case "eauChaude":
        return {
          icon: <FaFire className="w-4 h-4" />,
          color: "text-orange-600 dark:text-orange-400",
        };
      case "repartiteur":
        return {
          icon: <FaChartBar className="w-4 h-4" />,
          color: "text-purple-600 dark:text-purple-400",
        };
      case "compteurEnergie":
        return {
          icon: <FaBolt className="w-4 h-4" />,
          color: "text-green-600 dark:text-green-400",
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
              disabled={
                relevesOptions.length === 0 ||
                isExportingExcel ||
                isExportingPdf ||
                isImmeubleLoading
              }
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
              {isExportingExcel || isExportingPdf
                ? "Export en cours..."
                : "Export Excel & PDF"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 mb-6">
          <button
            onClick={() => handleTabChange("eauFroide")}
            className={getButtonClass("eauFroide")}
          >
            <span className={selectedTab === "eauFroide" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("eauFroide").icon}
            </span>
            <span>Eau froide</span>
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={getButtonClass("eauChaude")}
          >
            <span className={selectedTab === "eauChaude" ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("eauChaude").icon}
            </span>
            <span>Eau chaude</span>
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={getButtonClass("repartiteur")}
          >
            <span className={selectedTab === "repartiteur" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("repartiteur").icon}
            </span>
            <span>Répartiteur</span>
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={getButtonClass("compteurEnergie")}
          >
            <span className={selectedTab === "compteurEnergie" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
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

        {selectedTab === "repartiteur" && immeubleRepartStats && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            {(noteMensuelleError || donneesRepartitionError) && (
              <div className="mb-4 space-y-3">
                {noteMensuelleError && (
                  <div>
                    <Alert
                      variant={noteMensuelleError.variant || "error"}
                      title={noteMensuelleError.title}
                      message={noteMensuelleError.message}
                      showLink={false}
                    />
                    <button
                      type="button"
                      onClick={clearNoteMensuelleError}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Fermer
                    </button>
                  </div>
                )}
                {donneesRepartitionError && (
                  <div>
                    <Alert
                      variant={donneesRepartitionError.variant || "error"}
                      title={donneesRepartitionError.title}
                      message={donneesRepartitionError.message}
                      showLink={false}
                    />
                    <button
                      type="button"
                      onClick={clearDonneesRepartitionError}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-sm font-semibold tracking-wide text-gray-800 dark:text-white/90">
                DONNÉES DE LA DERNIÈRE RÉPARTITION
              </h4>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleExportNoteMensuelle}
                  disabled={isExportingNoteMensuelle || !latestRepartPkReleve}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.05]"
                >
                  {isExportingNoteMensuelle ? "Export en cours..." : "Export Notre mensuelle"}
                </button>
                <button
                  type="button"
                  onClick={handleExportDonneesRepartition}
                  disabled={isExportingDonneesRepartition || !latestRepartPkReleve}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.05]"
                >
                  {isExportingDonneesRepartition ? "Export en cours..." : "Export Données répartition"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                  Données de l&apos;immeuble
                </h5>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total des unités de répartition de l&apos;immeuble
                    </span>
                    <span className="font-semibold">{immeubleRepartStats.totURepart}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Total tantièmes chauffage</span>
                    <span className="font-semibold">{immeubleRepartStats.totTantChauff}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Prix unitaire du tantième</span>
                    <span className="font-semibold">{immeubleRepartStats.puTant}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Prix de l&apos;unité de répartition
                    </span>
                    <span className="font-semibold">{immeubleRepartStats.prixURepart}</span>
                  </div>
                </div>
              </div>

              <div className="lg:border-l lg:border-gray-200 lg:pl-6 dark:lg:border-gray-800">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                  &nbsp;
                </h5>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Prix de l&apos;abonnement</span>
                    <span className="font-semibold">{immeubleRepartStats.prixAbonn}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Montant à répartir aux tantièmes
                    </span>
                    <span className="font-semibold">{immeubleRepartStats.montARepartTant}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Part répartie en fonction des consommations
                    </span>
                    <span className="font-semibold">{immeubleRepartStats.partRepartConsos}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Coût total hors combustible</span>
                    <span className="font-semibold">{immeubleRepartStats.ctCombust}</span>
                  </div>
                </div>
              </div>
            </div>

            {showRepartLogementSection && (
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                  Données du logement
                </h5>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200 lg:grid-cols-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-400">Tantièmes logement</span>
                    <span className="font-semibold">{immeubleRepartStats.tantLog}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span className="text-gray-600 dark:text-gray-400">Coût du chauffage</span>
                    <span className="font-semibold">{immeubleRepartStats.ctChauffLog}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
      </div>

      {/* Modal for Excel export date selection */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="max-w-[500px] p-6 lg:p-8"
      >
        <h4 className="font-semibold text-gray-800 mb-6 text-title-sm dark:text-white/90 text-center">
          Sélectionner une date
        </h4>
        
        {relevesOptions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Aucun relevé disponible pour cet onglet.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de relevé
              </label>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg dark:border-gray-700">
                {relevesOptions.map((option) => (
                  <button
                    key={option.pkReleve}
                    onClick={() => setSelectedPkReleve(option.pkReleve)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-gray-100 last:border-b-0 dark:border-gray-800 ${
                      selectedPkReleve === option.pkReleve
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleModalExportPdf}
                disabled={!selectedPkReleve || isExportingPdf}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPdf ? "Export en cours..." : "Export PDF"}
              </button>
              <button
                onClick={handleModalExportExcel}
                disabled={!selectedPkReleve || isExportingExcel}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingExcel ? "Export en cours..." : "Export Excel"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

