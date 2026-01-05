"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useOperators } from "@/lib/hooks/useOperators";
import type { Operator, Building } from "@/lib/types/api";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { handleApiError } from "@/lib/api/client";
import Checkbox from "@/components/form/input/Checkbox";
import { LoadingSpinner } from "@/components/ui/loading";

export default function ListOperators() {
  const { getOperatorsQuery, deleteOperator, isDeleting, deleteError, getOperatorQuery, addBuildings, removeBuildings, isAddingBuildings, isRemovingBuildings } = useOperators();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null);
  const [operatorToShare, setOperatorToShare] = useState<Operator | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const shareModal = useModal();

  // Load operators data
  const {
    data: operatorsData,
    isLoading: isLoadingQuery,
    error: operatorsError,
    refetch: refetchOperators,
  } = getOperatorsQuery;

  useEffect(() => {
    if (operatorsData) {
      setOperators(operatorsData.users ?? []);
      setErrorMessage(null);
    }
  }, [operatorsData]);

  // Handle delete confirmation
  const handleDeleteClick = (operator: Operator) => {
    setOperatorToDelete(operator);
    openModal();
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!operatorToDelete?.PKUser) {
      return;
    }

    try {
      await deleteOperator(operatorToDelete.PKUser);
      // Refresh the list
      await refetchOperators();
      // Close modal and reset state on success
      closeModal();
      setOperatorToDelete(null);
      setErrorMessage(null); // Clear any previous errors
    } catch (error) {
      console.error("Error deleting operator:", error);
      const errorMessage = handleApiError(error);
      setErrorMessage(
        deleteError || errorMessage || "Une erreur s'est produite lors de la suppression."
      );
      // Keep modal open on error so user can retry or cancel
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    closeModal();
    setOperatorToDelete(null);
    setErrorMessage(null); // Clear error when canceling
  };

  // Handle share buildings click
  const handleShareClick = (operator: Operator) => {
    setOperatorToShare(operator);
    setErrorMessage(null);
    shareModal.openModal();
  };

  // Handle cancel share
  const handleCancelShare = () => {
    shareModal.closeModal();
    setOperatorToShare(null);
    setErrorMessage(null);
  };

  // Format number with thousands separator
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) {
      return "0";
    }
    return num.toLocaleString('fr-FR');
  };

  // Show loading state
  if (isLoadingQuery) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement des gestionnaires...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (errorMessage || operatorsError) {
    const errorMsg = errorMessage || (typeof operatorsError === 'string' ? operatorsError : operatorsError?.message) || "Impossible de charger les gestionnaires.";
    return (
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-6 dark:border-red-900/60 dark:bg-red-950/40 sm:px-6">
        <Alert
          variant="error"
          title="Erreur"
          message={errorMsg}
        />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste des Gestionnaires
            </h3>
            {operators.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {operators.length} gestionnaire{operators.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/gestionnaire/nouveau">
              <Button
                size="sm"
                variant="primary"
                className="inline-flex items-center gap-2"
              >
                <svg
                  className="stroke-current fill-white"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4.16667V15.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.16667 10H15.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nouveau gestionnaire
              </Button>
            </Link>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4">
            <Alert variant="error" title="Erreur" message={errorMessage} />
          </div>
        )}

        {operators.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun gestionnaire enregistré.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Nom
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Prénom
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Nombre d&apos;immeubles
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {operators.map((operator) => {
                const pkUser = operator.PKUser;
                const userName = operator.UserName ?? "";
                const firstName = operator.FirstName ?? "";
                const email = operator.EMail ?? operator.LoginID ?? "";
                const nbImmeubles = operator.NbImmeubles ?? 0;

                return (
                  <TableRow key={pkUser} className="align-top">
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                      {userName || "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                      {firstName || "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                      {email || "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                      {formatNumber(nbImmeubles)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/gestionnaire/${pkUser}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-2"
                          >
                            <svg
                              className="stroke-current"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8 13.3333H14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M11 2.33333C11.2652 2.06812 11.6249 1.91919 12 1.91919C12.1857 1.91919 12.3696 1.95528 12.5412 2.02541C12.7128 2.09554 12.8687 2.19835 13 2.32833C13.1313 2.45831 13.2355 2.61288 13.3069 2.78318C13.3783 2.95348 13.4154 3.13605 13.4154 3.32033C13.4154 3.50461 13.3783 3.68718 13.3069 3.85748C13.2355 4.02778 13.1313 4.18235 13 4.31233L4.66667 12.6457L2 13.3333L2.66667 10.6667L11 2.33333Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Editer
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareClick(operator)}
                          className="inline-flex items-center gap-2"
                        >
                          <svg
                            className="stroke-current"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.6667 8.66667C11.219 8.66667 11.6667 8.219 11.6667 7.66667C11.6667 7.11433 11.219 6.66667 10.6667 6.66667C10.1143 6.66667 9.66667 7.11433 9.66667 7.66667C9.66667 8.219 10.1143 8.66667 10.6667 8.66667Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33333 4.66667C5.88562 4.66667 6.33333 4.21895 6.33333 3.66667C6.33333 3.11438 5.88562 2.66667 5.33333 2.66667C4.78105 2.66667 4.33333 3.11438 4.33333 3.66667C4.33333 4.21895 4.78105 4.66667 5.33333 4.66667Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33333 13.3333C5.88562 13.3333 6.33333 12.8856 6.33333 12.3333C6.33333 11.781 5.88562 11.3333 5.33333 11.3333C4.78105 11.3333 4.33333 11.781 4.33333 12.3333C4.33333 12.8856 4.78105 13.3333 5.33333 13.3333Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6.33333 3.66667L9.66667 7.66667"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6.33333 12.3333L9.66667 8.33333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Editer partage immeuble
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(operator)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 text-error-600 hover:text-error-700 hover:border-error-500 dark:text-error-400 dark:hover:text-error-300"
                        >
                          <svg
                            className="stroke-current"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4H3.33333H14"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6.66667 7.33333V11.3333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.33333 7.33333V11.3333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancelDelete}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer le gestionnaire{" "}
              <span className="font-medium text-gray-800 dark:text-white/90">
                {operatorToDelete?.FirstName} {operatorToDelete?.UserName}
              </span>
              ? Cette action est irréversible.
            </p>
          </div>

          {/* Error message in modal */}
          {errorMessage && (
            <div className="mt-4">
              <Alert variant="error" title="Erreur" message={errorMessage} />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-error-500 hover:bg-error-600"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Buildings Modal */}
      {operatorToShare && (
        <ShareBuildingsModal
          operator={operatorToShare}
          isOpen={shareModal.isOpen}
          onClose={handleCancelShare}
          getOperatorQuery={getOperatorQuery}
          addBuildings={addBuildings}
          removeBuildings={removeBuildings}
          isAddingBuildings={isAddingBuildings}
          isRemovingBuildings={isRemovingBuildings}
          onSuccess={() => {
            handleCancelShare();
            refetchOperators();
          }}
        />
      )}
    </>
  );
}

/**
 * Modal component for sharing buildings with an operator
 */
interface ShareBuildingsModalProps {
  operator: Operator;
  isOpen: boolean;
  onClose: () => void;
  getOperatorQuery: ReturnType<typeof useOperators>["getOperatorQuery"];
  addBuildings: (id: string | number, params: { immeubles?: (string | number)[]; all?: boolean }) => Promise<{ immeubles: Building[] }>;
  removeBuildings: (id: string | number, params: { immeubles?: (string | number)[]; all?: boolean }) => Promise<{ immeubles: Building[] }>;
  isAddingBuildings: boolean;
  isRemovingBuildings: boolean;
  onSuccess: () => void;
}

function ShareBuildingsModal({
  operator,
  isOpen,
  onClose,
  getOperatorQuery,
  addBuildings,
  removeBuildings,
  isAddingBuildings,
  isRemovingBuildings,
  onSuccess,
}: ShareBuildingsModalProps) {
  const [selectedToAdd, setSelectedToAdd] = useState<(string | number)[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<(string | number)[]>([]);
  const [shareError, setShareError] = useState<string | null>(null);

  const {
    data: operatorData,
    isLoading,
    error: operatorError,
    refetch: refetchOperator,
  } = getOperatorQuery(operator.PKUser);

  // Debug: log the raw operatorData to see what we're getting
  // eslint-disable-next-line no-console
  console.log("[ShareBuildingsModal] operatorData:", operatorData);
  // eslint-disable-next-line no-console
  console.log("[ShareBuildingsModal] operatorData?.immeubles:", operatorData?.immeubles);
  // eslint-disable-next-line no-console
  console.log("[ShareBuildingsModal] operatorData?.diffImmeubles:", operatorData?.diffImmeubles);

  // immeubles is an array, diffImmeubles can be an object with numeric keys or an array
  const assignedImmeubles = Array.isArray(operatorData?.immeubles)
    ? operatorData!.immeubles
    : [];
  
  // Handle diffImmeubles: it can be an array or an object with numeric keys
  let availableImmeubles: Building[] = [];
  if (operatorData?.diffImmeubles) {
    if (Array.isArray(operatorData.diffImmeubles)) {
      availableImmeubles = operatorData.diffImmeubles;
    } else if (typeof operatorData.diffImmeubles === 'object') {
      // Convert object to array: { "68": {...}, "85": {...} } -> [{...}, {...}]
      availableImmeubles = Object.values(operatorData.diffImmeubles) as Building[];
    }
  }

  // eslint-disable-next-line no-console
  console.log("[ShareBuildingsModal] assignedImmeubles:", assignedImmeubles);
  // eslint-disable-next-line no-console
  console.log("[ShareBuildingsModal] availableImmeubles:", availableImmeubles);

  // Reset selections when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen) {
      setSelectedToAdd([]);
      setSelectedToRemove([]);
      setShareError(null);
      refetchOperator();
    }
  }, [isOpen, refetchOperator]);

  const handleToggleAdd = (pkImmeuble: string | number) => {
    setSelectedToAdd((prev) =>
      prev.includes(pkImmeuble)
        ? prev.filter((id) => id !== pkImmeuble)
        : [...prev, pkImmeuble]
    );
  };

  const handleToggleRemove = (pkImmeuble: string | number) => {
    setSelectedToRemove((prev) =>
      prev.includes(pkImmeuble)
        ? prev.filter((id) => id !== pkImmeuble)
        : [...prev, pkImmeuble]
    );
  };

  const handleSave = async () => {
    setShareError(null);
    try {
      // Remove buildings first
      if (selectedToRemove.length > 0) {
        await removeBuildings(operator.PKUser, {
          immeubles: selectedToRemove,
        });
      }

      // Add buildings
      if (selectedToAdd.length > 0) {
        await addBuildings(operator.PKUser, {
          immeubles: selectedToAdd,
        });
      }

      // Refresh data
      await refetchOperator();
      onSuccess();
    } catch (error) {
      console.error("Error updating building shares:", error);
      setShareError(
        handleApiError(error) || "Une erreur s'est produite lors de la mise à jour du partage."
      );
    }
  };

  const getBuildingName = (building: Building): string => {
    const immeuble = building.Immeuble ?? building;
    const numero = immeuble.Numero ?? immeuble.numero ?? "";
    const nom = immeuble.Nom ?? immeuble.nom ?? "";
    const adresse1 = immeuble.Adresse1 ?? immeuble.adresse1 ?? "";
    
    if (nom) return nom;
    if (numero && adresse1) return `${numero} - ${adresse1}`;
    if (numero) return `Immeuble ${numero}`;
    if (adresse1) return adresse1;
    return `Immeuble ${immeuble.PkImmeuble ?? immeuble.pkImmeuble ?? ""}`;
  };

  const isLoadingData = isLoading || isAddingBuildings || isRemovingBuildings;
  const hasChanges = selectedToAdd.length > 0 || selectedToRemove.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-5 lg:p-10"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Editer partage immeuble
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Gérer les immeubles assignés au gestionnaire{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {operator.FirstName} {operator.UserName}
            </span>
          </p>
          {operatorData?.user && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Nombre actuel d&apos;immeubles: 
            <span className="font-medium text-gray-800 dark:text-white/90">
              {assignedImmeubles.length}
            </span>
          </p>
          )}
        </div>

        {/* Error message */}
        {(shareError || operatorError) && (
          <div className="mt-4">
            <Alert
              variant="error"
              title="Erreur"
              message={
                shareError ||
                (typeof operatorError === "string"
                  ? operatorError
                  : operatorError?.message) ||
                "Impossible de charger les immeubles."
              }
            />
          </div>
        )}

        {isLoadingData && !operatorData ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Assigned Buildings */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Immeubles assignés ({assignedImmeubles.length})
              </h4>
              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                {assignedImmeubles.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun immeuble assigné
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedImmeubles.map((building: Building) => {
                      const immeuble = building.Immeuble ?? building;
                      const pkImmeuble =
                        immeuble.PkImmeuble ?? immeuble.pkImmeuble ?? "";
                      // Par défaut, les immeubles assignés sont cochés.
                      // Si l'utilisateur décoche, on les ajoute à selectedToRemove.
                      const isSelected = !selectedToRemove.includes(pkImmeuble);

                      return (
                        <div
                          key={pkImmeuble}
                          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Checkbox
                            id={`remove-${pkImmeuble}`}
                            checked={isSelected}
                            onChange={() => handleToggleRemove(pkImmeuble)}
                            label={getBuildingName(building)}
                            disabled={isLoadingData}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Available Buildings */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Immeubles disponibles ({availableImmeubles.length})
              </h4>
              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                {availableImmeubles.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun immeuble disponible
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableImmeubles.map((building: Building) => {
                      const immeuble = building.Immeuble ?? building;
                      const pkImmeuble =
                        immeuble.PkImmeuble ?? immeuble.pkImmeuble ?? "";
                      const isSelected = selectedToAdd.includes(pkImmeuble);

                      return (
                        <div
                          key={pkImmeuble}
                          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Checkbox
                            id={`add-${pkImmeuble}`}
                            checked={isSelected}
                            onChange={() => handleToggleAdd(pkImmeuble)}
                            label={getBuildingName(building)}
                            disabled={isLoadingData}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoadingData}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            disabled={isLoadingData || !hasChanges}
          >
            {isLoadingData
              ? "Enregistrement..."
              : hasChanges
              ? `Enregistrer (${selectedToAdd.length + selectedToRemove.length} modification${selectedToAdd.length + selectedToRemove.length > 1 ? "s" : ""})`
              : "Enregistrer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

