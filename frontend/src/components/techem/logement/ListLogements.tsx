"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaFaucet, FaChartBar, FaBolt } from "react-icons/fa";
import StatusIconsAlerte from '@/components/techem/images/StatusIconsAlerte';
import StatusIconsAnomalie from '@/components/techem/images/StatusIconsAnomalie';
import StatusIconsDysfonctionnement from '@/components/techem/images/StatusIconsDysfonctionnement';
import StatusIconsFuite from '@/components/techem/images/StatusIconsFuite';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLogements, FilterLogementsResponse } from "@/lib/hooks/useLogements";
import { useExport } from "@/lib/hooks/useExport";
import Alert from "@/components/ui/alert/Alert";
import type { Housing, Device } from "@/lib/types/api";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/lib/hooks/useAuth";
import AppareilsTable from "./AppareilsTable";
import ToggleSwitchListLogements from "./form/ToggleSwitchListLogements";
import DemandeInterventionModal from "./form/demande-intervention";
import { LoadingTable } from "@/components/ui/loading";
import { usePrefetchOnHover } from "@/lib/cache/usePrefetch";

interface ListLogementsProps {
  pkImmeuble: string;
}

export default function ListLogements({ pkImmeuble }: ListLogementsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filterLogements, isFiltering, exportLogements } = useLogements();
  const { prefetchOnHover } = usePrefetchOnHover();
  const { user } = useAuth();
  const [logements, setLogements] = useState<FilterLogementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<{ title: string; message: string } | null>(null);
  const appareilsModal = useModal();
  const filterModal = useModal();
  const demandeInterventionModal = useModal();
  const [selectedPkLogement, setSelectedPkLogement] = useState<string | number | null>(null);
  const [selectedType, setSelectedType] = useState<"eau" | "chauffage" | null>(null);
  const [selectedAppareils, setSelectedAppareils] = useState<Device[]>([]);
  const [interventionPkLogement, setInterventionPkLogement] = useState<string | number | null>(null);
  const [interventionOccupantNom, setInterventionOccupantNom] = useState<string>("");
  const [filterEtage, setFilterEtage] = useState("");
  const [filterEscalier, setFilterEscalier] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");

  const hasTicketPermission =
    user?.hasTicketPermission === true ||
    user?.hasTicketPermission === 1 ||
    user?.hasTicketPermission === "1";

  // Create wrapper function for export
  const handleExportLogements = useCallback(async () => {
    await exportLogements(pkImmeuble);
  }, [exportLogements, pkImmeuble]);

  // Use the reusable export hook
  const { handleExport: _handleExport, isExporting: _isExporting, error: exportError, clearError: clearExportError } = useExport(handleExportLogements); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Get active filters from URL parameters
  const activeFilters = useMemo(() => {
    const equipmentParam = searchParams.get('equipment');
    const equipment = equipmentParam ? equipmentParam.split(',') : [];
    
    return {
      fuites: searchParams.get('fuites') === '1',
      anomalies: searchParams.get('anomalies') === '1',
      dysfonctionnements: searchParams.get('dysfonctionnements') === '1',
      depannages: searchParams.get('depannages') === '1',
      equipment: equipment,
    };
  }, [searchParams]);

  // Get filter type for display (single filter for backward compatibility)
  const filterType = useMemo(() => {
    const hasIssueFilters = activeFilters.fuites || activeFilters.anomalies || 
                           activeFilters.dysfonctionnements || activeFilters.depannages;
    const hasEquipmentFilters = activeFilters.equipment && activeFilters.equipment.length > 0;
    
    if (!hasIssueFilters && !hasEquipmentFilters) return null;
    
    const issueCount = [activeFilters.fuites, activeFilters.anomalies, 
                       activeFilters.dysfonctionnements, activeFilters.depannages]
                       .filter(Boolean).length;
    
    if (issueCount === 1 && !hasEquipmentFilters) {
      if (activeFilters.fuites) return 'fuites';
      if (activeFilters.dysfonctionnements) return 'dysfonctionnements';
      if (activeFilters.anomalies) return 'anomalies';
      if (activeFilters.depannages) return 'depannages';
    }
    return 'multiple'; // Multiple filters active
  }, [activeFilters]);

  // Get initial filter values from URL (for the form)
  const initialFilters = useMemo(() => {
    return {
      fuites: activeFilters.fuites,
      anomalies: activeFilters.anomalies,
      dysfonctionnements: activeFilters.dysfonctionnements,
      depannages: activeFilters.depannages,
      equipment: activeFilters.equipment,
    };
  }, [activeFilters]);

  // Handle filter application
  const handleApplyFilters = (filters: {
    fuites: boolean;
    anomalies: boolean;
    dysfonctionnements: boolean;
    depannages: boolean;
    equipment: string[];
  }) => {
    const params = new URLSearchParams();
    
    // Only add active filters to URL
    if (filters.fuites) params.set('fuites', '1');
    if (filters.anomalies) params.set('anomalies', '1');
    if (filters.dysfonctionnements) params.set('dysfonctionnements', '1');
    if (filters.depannages) params.set('depannages', '1');
    if (filters.equipment && filters.equipment.length > 0) {
      params.set('equipment', filters.equipment.join(','));
    }

    // Navigate with new filters
    const queryString = params.toString();
    router.push(`/immeuble/${pkImmeuble}/logements${queryString ? `?${queryString}` : ''}`);
    filterModal.closeModal();
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadLogements = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        const response = await filterLogements({ pkImmeuble });
        if (isMounted) {
          setLogements(response);
          setLoadingError(null);
        }
      } catch (err) {
        console.error("Error loading logements:", err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
          let errorTitle = "Erreur de chargement";
          let errorMsg = errorMessage;
          
          if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
            errorTitle = "API non disponible";
            errorMsg = "Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.";
          } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
            errorTitle = "Erreur serveur";
            errorMsg = "Une erreur s'est produite côté serveur. Veuillez réessayer plus tard.";
          } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
            errorTitle = "Ressource introuvable";
            errorMsg = "La ressource demandée n'a pas été trouvée.";
          } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
            errorTitle = "Non autorisé";
            errorMsg = "Vous n'êtes pas autorisé à accéder à cette ressource.";
          } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
            errorTitle = "Accès refusé";
            errorMsg = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.";
          }
          
          setLoadingError({ title: errorTitle, message: errorMsg });
          setLogements(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLogements();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkImmeuble]);


  // Format number with thousands separator
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString('fr-FR');
  };

  // Get logement issues values
  const getLogementIssues = (logement: Housing) => {
    return {
      nbAnomalies: logement.NbAnomalies ?? logement.nbAnomalies ?? 0,
      nbFuites: logement.NbFuites ?? logement.nbFuites ?? 0,
      nbDepannages: logement.NbDepannages ?? logement.nbDepannages ?? 0,
      nbDysfonctionnements: logement.NbDysfonctionnements ?? logement.nbDysfonctionnements ?? 0,
    };
  };

  // Get occupant reference (Référence client)
  const getOccupantRef = (logement: Housing): string => {
    const occupant = logement.Occupant ?? logement.occupant;
    return occupant?.Ref ?? occupant?.ref ?? "";
  };

  // Get logement etage
  const getLogementEtage = (logement: Housing): string => {
    const logementObj = logement.Logement ?? logement;
    return logementObj?.NumEtage ?? logementObj?.numEtage ?? "";
  };

  // Get logement numéro batiment
  const getLogementBatiment = (logement: Housing): string => {
    const logementObj = logement.Logement ?? logement;
    return logementObj?.NumBatiment ?? logementObj?.numBatiment ?? "";
  };

  // Get logement numéro escalier
  const getLogementEscalier = (logement: Housing): string => {
    const logementObj = logement.Logement ?? logement;
    return logementObj?.NumEscalier ?? logementObj?.numEscalier ?? "";
  };

  // Get logement num ordre
  const getLogementNumOrdre = (logement: Housing): string => {
    const logementObj = logement.Logement ?? logement;
    return logementObj?.NumOrdre ?? logementObj?.numOrdre ?? "";
  };

  // Get occupant name
  const getOccupantName = (logement: Housing): string => {
    const occupant = logement.Occupant ?? logement.occupant;
    return occupant?.Nom ?? occupant?.nom ?? "—";
  };

  // Get number of cold water counters
  const getNbCompteursEF = (logement: Housing): number => {
    return logement.NbCompteursEF ?? logement.nbCompteursEF ?? 0;
  };

  // Get number of hot water counters
  const getNbCompteursEC = (logement: Housing): number => {
    return logement.NbCompteursEC ?? logement.nbCompteursEC ?? 0;
  };

  // Get number of repartiteurs
  const getNbCompteursRepart = (logement: Housing): number => {
    return logement.NbCompteursRepart ?? logement.nbCompteursRepart ?? 0;
  };

  // Get number of energy counters
  const getNbCompteursCET = (logement: Housing): number => {
    return logement.NbCompteursCET ?? logement.nbCompteursCET ?? 0;
  };

  // Get appareils from logement data
  const getAppareilsByType = (logement: Housing, type: "eau" | "chauffage"): Device[] => {
    const listeAppareils = logement.ListeAppareils?.appareil ?? logement.listeAppareils?.appareil ?? [];
    
    if (type === "eau") {
      // Filter for EF (Eau Froide) and EC (Eau Chaude)
      return listeAppareils.filter((app: Device) => {
        const fluide = app.Fluide ?? app.fluide ?? "";
        const typeAppareil = app.TypeAppareil ?? app.typeAppareil ?? app.Type ?? app.type ?? "";
        return fluide === "EF" || fluide === "EC" || typeAppareil === "EF" || typeAppareil === "EC";
      });
    } else {
      // Filter for Repart and CET
      return listeAppareils.filter((app: Device) => {
        const typeAppareil = app.TypeAppareil ?? app.typeAppareil ?? app.Type ?? app.type ?? "";
        return typeAppareil === "Repart" || typeAppareil === "CET";
      });
    }
  };

  // Handle opening appareils modal
  const handleOpenAppareilsModal = (
    e: React.MouseEvent,
    pkLogement: string | number,
    type: "eau" | "chauffage",
    logement: Housing
  ) => {
    e.stopPropagation();
    const appareils = getAppareilsByType(logement, type);
    setSelectedPkLogement(pkLogement);
    setSelectedType(type);
    setSelectedAppareils(appareils);
    appareilsModal.openModal();
  };

  // Unique values for dropdown filters (from full list)
  const { uniqueEtages, uniqueEscaliers, uniqueBatiments } = useMemo(() => {
    const logementsList = logements?.logements ?? [];
    const etages = new Set<string>();
    const escaliers = new Set<string>();
    const batiments = new Set<string>();
    logementsList.forEach((item) => {
      const logement = item.infosLogement;
      const etage = getLogementEtage(logement);
      const escalier = getLogementEscalier(logement);
      const batiment = getLogementBatiment(logement);
      if (etage !== undefined && etage !== null) etages.add(String(etage).trim());
      if (escalier !== undefined && escalier !== null) escaliers.add(String(escalier).trim());
      if (batiment !== undefined && batiment !== null) batiments.add(String(batiment).trim());
    });
    return {
      uniqueEtages: Array.from(etages).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      uniqueEscaliers: Array.from(escaliers).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      uniqueBatiments: Array.from(batiments).filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };
  }, [logements]);

  // Filter logements based on active filters and dropdown filters (etage, escalier, batiment)
  const filteredLogements = useMemo(() => {
    const logementsList = logements?.logements ?? [];
    
    const hasIssueFilters = activeFilters.fuites || activeFilters.anomalies || 
                           activeFilters.dysfonctionnements || activeFilters.depannages;
    const hasEquipmentFilters = activeFilters.equipment && activeFilters.equipment.length > 0;
    const hasDropdownFilters = filterEtage !== "" || filterEscalier !== "" || filterBatiment !== "";
    
    if (!hasIssueFilters && !hasEquipmentFilters && !hasDropdownFilters) {
      return logementsList;
    }

    return logementsList.filter((item) => {
      const logement = item.infosLogement;
      const issues = getLogementIssues(logement);

      // Check if logement matches all active issue filters
      if (activeFilters.fuites && issues.nbFuites === 0) return false;
      if (activeFilters.anomalies && issues.nbAnomalies === 0) return false;
      if (activeFilters.dysfonctionnements && issues.nbDysfonctionnements === 0) return false;
      if (activeFilters.depannages && issues.nbDepannages === 0) return false;

      // Check equipment filters
      if (hasEquipmentFilters && activeFilters.equipment) {
        const nbCompteursEF = getNbCompteursEF(logement);
        const nbCompteursEC = getNbCompteursEC(logement);
        const nbCompteursRepart = getNbCompteursRepart(logement);
        const nbCompteursCET = getNbCompteursCET(logement);
        
        const equipmentCounts = {
          'eau-froide': nbCompteursEF,
          'eau-chaude': nbCompteursEC,
          'compteur-energie-thermique': nbCompteursCET,
          'repartiteur': nbCompteursRepart,
        };

        const hasSelectedEquipment = activeFilters.equipment.some(
          (equipType) => equipmentCounts[equipType as keyof typeof equipmentCounts] > 0
        );

        if (!hasSelectedEquipment) return false;
      }

      // Dropdown filters: étage, escalier, batiment
      if (filterEtage !== "" && getLogementEtage(logement) !== filterEtage) return false;
      if (filterEscalier !== "" && getLogementEscalier(logement) !== filterEscalier) return false;
      if (filterBatiment !== "" && getLogementBatiment(logement) !== filterBatiment) return false;

      return true;
    });
  }, [logements, activeFilters, filterEtage, filterEscalier, filterBatiment]);

  // Show loading state
  if (isLoading || isFiltering) {
    return (
      <LoadingTable 
        variant="spinner"
        message="Chargement des logements..."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {loadingError && (
        <div className="mb-4">
          <Alert
            variant="error"
            title={loadingError.title}
            message={loadingError.message}
            showLink={false}
          />
          <button
            onClick={() => setLoadingError(null)}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Fermer
          </button>
        </div>
      )}
      {exportError && (
        <div className="mb-4">
          <Alert
            variant={exportError.variant || "error"}
            title={exportError.title}
            message={exportError.message}
            showLink={false}
          />
          <button
            onClick={clearExportError}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Fermer
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des Logements
          </h3>
          {filteredLogements.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredLogements.length} logement{filteredLogements.length > 1 ? 's' : ''}
              {filterType && filterType !== 'multiple' && (
                <span className="ml-2">
                  ({filterType === 'fuites' && 'avec fuites'}
                  {filterType === 'dysfonctionnements' && 'avec dysfonctionnements'}
                  {filterType === 'anomalies' && 'avec anomalies'}
                  {filterType === 'depannages' && 'avec dépannages'})
                </span>
              )}
              {filterType === 'multiple' && (
                <span className="ml-2">
                  (filtrés)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterEtage}
            onChange={(e) => setFilterEtage(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
          >
            <option value="">Tous les étages</option>
            {uniqueEtages.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            value={filterEscalier}
            onChange={(e) => setFilterEscalier(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
          >
            <option value="">Tous les escaliers</option>
            {uniqueEscaliers.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            value={filterBatiment}
            onChange={(e) => setFilterBatiment(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm text-gray-700 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
          >
            <option value="">Tous les bâtiments</option>
            {uniqueBatiments.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button 
            onClick={filterModal.openModal}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
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
                d="M2.29004 10H17.7067"
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
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        {filteredLogements.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filterType 
                ? filterType === 'multiple'
                  ? 'Aucun logement ne correspond aux filtres sélectionnés'
                  : `Aucun logement avec ${filterType === 'fuites' ? 'des fuites' : filterType === 'dysfonctionnements' ? 'des dysfonctionnements' : filterType === 'anomalies' ? 'des anomalies' : 'des dépannages'} trouvé`
                : 'Aucun logement trouvé'
              }
            </p>
          </div>
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Logement
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaFaucet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Eau</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaChartBar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Répartiteurs</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaBolt className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Compteurs d&apos;énergie</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Statut
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLogements.map((item, index) => {
                const logement = item.infosLogement;
                const logementObj = logement.Logement ?? logement;
                const pkLogement = logementObj?.PkLogement ?? logementObj?.pkLogement ?? null;
                const occupantRef = getOccupantRef(logement);
                const logementEtage = getLogementEtage(logement);
                const logementBatiment = getLogementBatiment(logement);
                const logementEscalier = getLogementEscalier(logement);
                const logementNumOrdre = getLogementNumOrdre(logement);
                const occupantName = getOccupantName(logement);
                const nbCompteursEF = getNbCompteursEF(logement);
                const nbCompteursEC = getNbCompteursEC(logement);
                const nbCompteursRepart = getNbCompteursRepart(logement);
                const nbCompteursCET = getNbCompteursCET(logement);
                const issues = getLogementIssues(logement);

                // Create a unique key combining pkLogement, occupantRef, and index
                const uniqueKey = pkLogement || `${occupantRef}-${logementEtage}-${logementNumOrdre}-${index}`;

                const handleRowClick = (e: React.MouseEvent) => {
                  // Don't navigate if clicking on a link or button
                  const target = e.target as HTMLElement;
                  if (target.closest('a') || target.closest('button')) {
                    return;
                  }
                  if (pkLogement) {
                    router.push(`/immeuble/${pkImmeuble}/logements/${String(pkLogement)}`);
                  }
                };

                return (
                  <TableRow 
                    key={uniqueKey} 
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer"
                    onClick={handleRowClick}
                    onMouseEnter={() => {
                      // Précharger les données au survol de la ligne
                      if (pkLogement) {
                        prefetchOnHover(pkLogement);
                      }
                    }}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="space-y-1">
                            {(occupantRef || (hasTicketPermission && pkLogement)) && (
                              <p className="text-gray-800 text-theme-sm font-medium dark:text-white/90 flex flex-wrap items-center gap-2">
                                {occupantRef && (
                                  <>
                                    Référence client:{" "}
                                    <span className="font-normal">{occupantRef}</span>
                                  </>
                                )}
                                {hasTicketPermission && pkLogement && (
                                  <button
                                    type="button"
                                    className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setInterventionPkLogement(pkLogement);
                                      setInterventionOccupantNom(occupantName || "");
                                      demandeInterventionModal.openModal();
                                    }}
                                  >
                                    Demande d&apos;intervention
                                  </button>
                                )}
                              </p>
                            )}
                            {(logementEtage || logementNumOrdre || logementBatiment || logementEscalier) && (
                              <p className="text-gray-800 text-theme-sm font-medium dark:text-white/90">
                                {logementBatiment && <span>Bât.: <span className="font-normal">{logementBatiment}</span></span>}
                                {logementBatiment && logementEscalier && " "}
                                {logementEscalier && <span>Esc.: <span className="font-normal">{logementEscalier}</span></span>}
                                {(logementBatiment || logementEscalier) && (logementEtage || logementNumOrdre) && " "}
                                {logementEtage && <span>Etage: <span className="font-normal">{logementEtage}</span></span>}
                                {logementEtage && logementNumOrdre && " "}
                                {logementNumOrdre && <span>N° logement: <span className="font-normal">{logementNumOrdre}</span></span>}
                              </p>
                            )}
                            {occupantName && occupantName !== "—" && (
                              <p className="text-gray-600 text-theme-sm dark:text-gray-400">
                                {occupantName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`text-theme-sm ${nbCompteursEF + nbCompteursEC > 0 ? "text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" : "text-gray-500 dark:text-gray-400"}`}
                          onClick={(e) => {
                            if (nbCompteursEF + nbCompteursEC > 0) {
                              handleOpenAppareilsModal(e, pkLogement, "eau", logement);
                            }
                          }}
                        >
                          {formatNumber(nbCompteursEF + nbCompteursEC)}
                        </span>
                        {nbCompteursEF + nbCompteursEC > 0 && (
                          <div
                            className="cursor-pointer"
                            onClick={(e) => handleOpenAppareilsModal(e, pkLogement, "eau", logement)}
                          >
                            <FaFaucet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`text-theme-sm ${nbCompteursRepart > 0 ? "text-purple-600 dark:text-purple-400 cursor-pointer hover:underline" : "text-gray-500 dark:text-gray-400"}`}
                          onClick={(e) => {
                            if (nbCompteursRepart > 0) {
                              handleOpenAppareilsModal(e, pkLogement, "chauffage", logement);
                            }
                          }}
                        >
                          {formatNumber(nbCompteursRepart)}
                        </span>
                        {nbCompteursRepart > 0 && (
                          <div
                            className="cursor-pointer"
                            onClick={(e) => handleOpenAppareilsModal(e, pkLogement, "chauffage", logement)}
                          >
                            <FaChartBar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`text-theme-sm ${nbCompteursCET > 0 ? "text-green-600 dark:text-green-400cursor-pointer hover:underline" : "text-gray-500 dark:text-gray-400"}`}
                          onClick={(e) => {
                            if (nbCompteursCET > 0) {
                              handleOpenAppareilsModal(e, pkLogement, "chauffage", logement);
                            }
                          }}
                        >
                          {formatNumber(nbCompteursCET)}
                        </span>
                        {nbCompteursCET > 0 && (
                          <div
                            className="cursor-pointer"
                            onClick={(e) => handleOpenAppareilsModal(e, pkLogement, "chauffage", logement)}
                          >
                            <FaBolt className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {issues.nbAnomalies === 0 && issues.nbFuites === 0 && 
                       issues.nbDepannages === 0 && issues.nbDysfonctionnements === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          OK
                        </span>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 w-20">
                          {/* Row 1 - Col 1: Dysfonctionnements (Bell) */}
                          {issues.nbDysfonctionnements > 0 ? (
                            <Link 
                              href={`/immeuble/${pkImmeuble}/dysfonctionnements?logement=${pkLogement}`}
                              className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer"
                              title={`${issues.nbDysfonctionnements} dysfonctionnement${issues.nbDysfonctionnements > 1 ? 's' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <StatusIconsDysfonctionnement 
                                size={20} 
                                className="text-error-500 dark:text-error-400" 
                                color="currentColor"
                              />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsDysfonctionnement 
                                size={20} 
                                className="text-gray-400 dark:text-gray-500" 
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Row 1 - Col 2: Dépannages (Wrench) */}
                          {issues.nbDepannages > 0 ? (
                            <Link 
                              href={`/immeuble/${pkImmeuble}/interventions?logement=${pkLogement}`}
                              className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer"
                              title={`${issues.nbDepannages} dépannage${issues.nbDepannages > 1 ? 's' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <StatusIconsAlerte 
                                size={20} 
                                className="text-warning-500 dark:text-warning-400" 
                                color="currentColor"
                              />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsAlerte 
                                size={20} 
                                className="text-gray-400 dark:text-gray-500" 
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Row 2 - Col 1: Fuites (Teardrop) */}
                          {issues.nbFuites > 0 ? (
                            <Link 
                              href={`/immeuble/${pkImmeuble}/fuites?logement=${pkLogement}`}
                              className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer"
                              title={`${issues.nbFuites} fuite${issues.nbFuites > 1 ? 's' : ''}`}
                            >
                              <StatusIconsFuite 
                                size={20} 
                                className="text-blue-500 dark:text-blue-400" 
                                color="currentColor"
                              />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsFuite 
                                size={20} 
                                className="text-gray-400 dark:text-gray-500" 
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Row 2 - Col 2: Anomalies (Diamond exclamation) */}
                          {issues.nbAnomalies > 0 ? (
                            <Link 
                              href={`/immeuble/${pkImmeuble}/anomalies?logement=${pkLogement}`}
                              className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer"
                              title={`${issues.nbAnomalies} anomalie${issues.nbAnomalies > 1 ? 's' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <StatusIconsAnomalie 
                                size={20} 
                                className="text-warning-500 dark:text-warning-400" 
                                color="currentColor"
                              />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsAnomalie 
                                size={20} 
                                className="text-gray-400 dark:text-gray-500" 
                                color="currentColor"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={filterModal.isOpen}
        onClose={filterModal.closeModal}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <ToggleSwitchListLogements
          key={`filter-${JSON.stringify(initialFilters)}-${filterModal.isOpen}`}
          onApply={handleApplyFilters}
          onCancel={filterModal.closeModal}
          initialFilters={initialFilters}
        />
      </Modal>

      {/* Appareils Modal */}
      <Modal
        isOpen={appareilsModal.isOpen}
        onClose={appareilsModal.closeModal}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedType === "eau" ? "Appareils Eau" : "Appareils Chauffage"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Liste des appareils pour ce logement
            </p>
          </div>
          <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
            {selectedPkLogement && selectedType && selectedAppareils.length > 0 && (
              <AppareilsTable
                pkLogement={selectedPkLogement}
                type={selectedType}
                pkImmeuble={pkImmeuble}
                appareils={selectedAppareils}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Demande d'intervention Modal */}
      {hasTicketPermission && interventionPkLogement && (
        <DemandeInterventionModal
          isOpen={demandeInterventionModal.isOpen}
          onClose={() => {
            demandeInterventionModal.closeModal();
            setInterventionPkLogement(null);
            setInterventionOccupantNom("");
          }}
          pkLogement={String(interventionPkLogement)}
          occupantNom={interventionOccupantNom}
        />
      )}
    </div>
  );
}

