"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { useExport } from "@/lib/hooks/useExport";
import type { Building } from "@/lib/types/api";
import EquipementIconsEau from "@/components/techem/images/EquipementIconsEau";
import EquipementIconsRepartiteur from "@/components/techem/images/EquipementIconsRepartiteur";
import EquipementIconsCompteur from "@/components/techem/images/EquipementIconsCompteur";
import ToggleSwitchListImmeubles from "@/components/techem/immeuble/form/ToggleSwitchListImmeubles";
import Alert from "@/components/ui/alert/Alert";
import { LoadingTable } from "@/components/ui/loading";
import { usePrefetchOnHover } from "@/lib/cache/usePrefetch";


export default function ListImmeubles() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filterImmeubles, isFiltering, exportImmeubles } = useImmeubles();
  const { prefetchImmeubleLogements } = usePrefetchOnHover();
  const [immeubles, setImmeubles] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<{ title: string; message: string } | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  
  // Use the reusable export hook
  const { handleExport, isExporting, error: exportError, clearError: clearExportError } = useExport(exportImmeubles);

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
    router.push(`/immeuble${queryString ? `?${queryString}` : ''}`);
    closeModal();
  };

  // Filter immeubles based on active filters
  const filteredImmeubles = useMemo(() => {
    // If no filters are active, return all immeubles
    const hasIssueFilters = activeFilters.fuites || activeFilters.anomalies || 
                           activeFilters.dysfonctionnements || activeFilters.depannages;
    const hasEquipmentFilters = activeFilters.equipment && activeFilters.equipment.length > 0;
    
    if (!hasIssueFilters && !hasEquipmentFilters) {
      return immeubles;
    }

    return immeubles.filter((building) => {
      const issues = {
        nbAnomalies: building.NbAnomalies ?? building.nbAnomalies ?? 0,
        nbFuites: building.NbFuites ?? building.nbFuites ?? 0,
        nbDepannages: building.NbDepannages ?? building.nbDepannages ?? 0,
        nbDysfonctionnements: building.NbDysfonctionnements ?? building.nbDysfonctionnements ?? 0,
      };

      // Check if building matches all active issue filters
      // A building must have the issue if the filter is active
      if (activeFilters.fuites && issues.nbFuites === 0) return false;
      if (activeFilters.anomalies && issues.nbAnomalies === 0) return false;
      if (activeFilters.dysfonctionnements && issues.nbDysfonctionnements === 0) return false;
      if (activeFilters.depannages && issues.nbDepannages === 0) return false;

      // Check equipment filters
      if (hasEquipmentFilters && activeFilters.equipment) {
        const equipmentCounts = {
          'eau-froide': building.NbCompteursEF ?? building.nbCompteursEF ?? 0,
          'eau-chaude': building.NbCompteursEC ?? building.nbCompteursEC ?? 0,
          'compteur-energie-thermique': building.NbCompteursCET ?? building.nbCompteursCET ?? 0,
          'repartiteur': building.NbCompteursRepart ?? building.nbCompteursRepart ?? 0,
        };

        // Check if building has at least one of the selected equipment types
        const hasSelectedEquipment = activeFilters.equipment.some(
          (equipType) => equipmentCounts[equipType as keyof typeof equipmentCounts] > 0
        );

        if (!hasSelectedEquipment) return false;
      }

      // Building matches all active filters
      return true;
    });
  }, [immeubles, activeFilters]);

  useEffect(() => {
    // Load all buildings on component mount
    let isMounted = true;
    
    const loadImmeubles = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        const response = await filterImmeubles({});
        if (isMounted) {
          setImmeubles(response.immeubles || []);
          setLoadingError(null);
        }
      } catch (err) {
        console.error("Error loading immeubles:", err);
        if (isMounted) {
          setImmeubles([]);
          const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
          
          // Determine error type based on error message or structure
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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImmeubles();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Format number with thousands separator
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString('fr-FR');
  };

  // Get building issues values
  const getBuildingIssues = (building: Building) => {
    return {
      nbAnomalies: building.NbAnomalies ?? building.nbAnomalies ?? 0,
      nbFuites: building.NbFuites ?? building.nbFuites ?? 0,
      nbDepannages: building.NbDepannages ?? building.nbDepannages ?? 0,
      nbDysfonctionnements: building.NbDysfonctionnements ?? building.nbDysfonctionnements ?? 0,
    };
  };


  // Get building reference
  const getBuildingRef = (building: Building): string => {
    return building.ref ?? building.Ref ?? "";
  };

  // Get building numero
  const getBuildingNumero = (building: Building): string => {
    return building.numero ?? building.Numero ?? "";
  };

  // Get building address parts
  const getBuildingAddress1 = (building: Building): string => {
    return building.adresse1 ?? building.Adresse1 ?? "";
  };

  const getBuildingCp = (building: Building): string => {
    return building.cp ?? building.Cp ?? "";
  };

  const getBuildingVille = (building: Building): string => {
    return building.ville ?? building.Ville ?? "";
  };

  // Get number of cold water counters
  const getNbCompteursEF = (building: Building): number => {
    return building.nbCompteursEF ?? building.NbCompteursEF ?? 0;
  };

  // Get number of hot water counters
  const getNbCompteursEC = (building: Building): number => {
    return building.nbCompteursEC ?? building.NbCompteursEC ?? 0;
  };

  // Get number of repartiteurs
  const getNbCompteursRepart = (building: Building): number => {
    return building.nbCompteursRepart ?? building.NbCompteursRepart ?? 0;
  };

  // Get number of energy counters
  const getNbCompteursCET = (building: Building): number => {
    return building.nbCompteursCET ?? building.NbCompteursCET ?? 0;
  };

  // Show loading state
  if (isLoading || isFiltering) {
    return (
      <LoadingTable 
        variant="spinner"
        message="Chargement des immeubles..."
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
            Liste des Immeubles
          </h3>
          {filteredImmeubles.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredImmeubles.length} immeuble{filteredImmeubles.length > 1 ? 's' : ''}
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

        <div className="flex items-center gap-3">
          <button 
            onClick={openModal}
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
        {filteredImmeubles.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filterType 
                ? filterType === 'multiple'
                  ? 'Aucun immeuble ne correspond aux filtres sélectionnés'
                  : `Aucun immeuble avec ${filterType === 'fuites' ? 'des fuites' : filterType === 'dysfonctionnements' ? 'des dysfonctionnements' : filterType === 'anomalies' ? 'des anomalies' : 'des dépannages'} trouvé`
                : 'Aucun immeuble trouvé'
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
                Immeuble
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <EquipementIconsEau size={16} className="text-gray-400 dark:text-gray-500" />
                  <span>Eau froide</span>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <EquipementIconsEau size={16} className="text-gray-400 dark:text-gray-500" />
                  <span>Eau chaude</span>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <EquipementIconsRepartiteur size={16} className="text-gray-400 dark:text-gray-500" />
                  <span>Répartiteurs</span>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <EquipementIconsCompteur size={16} className="text-gray-400 dark:text-gray-500" />
                  <span>Compteurs d&apos;énergie</span>
                </div>
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <span>Statut</span>
                </div>
              </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredImmeubles.map((immeuble) => {
                const pkImmeuble = immeuble.PkImmeuble ?? immeuble.pkImmeuble ?? "";
                const buildingRef = getBuildingRef(immeuble);
                const buildingNumero = getBuildingNumero(immeuble);
                const buildingAddress1 = getBuildingAddress1(immeuble);
                const buildingCp = getBuildingCp(immeuble);
                const buildingVille = getBuildingVille(immeuble);
                const nbCompteursEF = getNbCompteursEF(immeuble);
                const nbCompteursEC = getNbCompteursEC(immeuble);
                const nbCompteursRepart = getNbCompteursRepart(immeuble);
                const nbCompteursCET = getNbCompteursCET(immeuble);
                const issues = getBuildingIssues(immeuble);

                const handleRowClick = (e: React.MouseEvent) => {
                  // Don't navigate if clicking on a link or button
                  const target = e.target as HTMLElement;
                  if (target.closest('a') || target.closest('button')) {
                    return;
                  }
                  if (pkImmeuble) {
                    router.push(`/immeuble/${pkImmeuble}`);
                  }
                };

                return (
                  <TableRow 
                    key={pkImmeuble} 
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer"
                    onClick={handleRowClick}
                    onMouseEnter={() => {
                      // Précharger les logements de l'immeuble au survol
                      if (pkImmeuble) {
                        prefetchImmeubleLogements(pkImmeuble);
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="space-y-1">
                            {buildingRef && (
                              <p className="text-gray-800 text-theme-sm font-medium dark:text-white/90">
                                Référence: <span className="font-normal">{buildingRef}</span>
                              </p>
                            )}
                            {buildingNumero && (
                              <p className="text-gray-800 text-theme-sm font-medium dark:text-white/90">
                                N° d&apos;immeuble: <span className="font-normal">{buildingNumero}</span>
                              </p>
                            )}
                            {buildingAddress1 && (
                              <p className="text-gray-600 text-theme-sm dark:text-gray-400">
                                {buildingAddress1}
                              </p>
                            )}
                            {(buildingCp || buildingVille) && (
                              <p className="text-gray-600 text-theme-sm dark:text-gray-400">
                                {[buildingCp, buildingVille].filter(Boolean).join(" ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {formatNumber(nbCompteursEF)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {formatNumber(nbCompteursEC)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {formatNumber(nbCompteursRepart)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {formatNumber(nbCompteursCET)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      <div className="grid grid-cols-2 gap-2 w-20">
                        {/* Row 1 - Col 1: Dysfonctionnements (Bell) */}
                        {issues.nbDysfonctionnements > 0 ? (
                          <Link 
                            href={`/immeuble/${pkImmeuble}/dysfonctionnements`}
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
                            href={`/immeuble/${pkImmeuble}/interventions`}
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
                            href={`/immeuble/${pkImmeuble}/fuites`}
                            className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity cursor-pointer"
                            title={`${issues.nbFuites} fuite${issues.nbFuites > 1 ? 's' : ''}`}
                            onClick={(e) => e.stopPropagation()}
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
                            href={`/immeuble/${pkImmeuble}/anomalies`}
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
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <ToggleSwitchListImmeubles
          key={`filter-${JSON.stringify(initialFilters)}-${isOpen}`}
          onApply={handleApplyFilters}
          onCancel={closeModal}
          initialFilters={initialFilters}
        />
      </Modal>
    </div>
  );
}
