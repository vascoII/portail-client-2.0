"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFactures } from "@/lib/hooks/useFactures";
import type { Invoice } from "@/lib/types/api";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { handleApiError } from "@/lib/api/client";

export default function ListFactures() {
  const { getFacturesQuery, downloadFacture } = useFactures();
  const [factures, setFactures] = useState<Invoice[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key:
      | "numero"
      | "codeGestio"
      | "adresse"
      | "ville"
      | "cp"
      | "dateEdition"
      | "montantHT"
      | "montantTTC"
      | "montantAPayer";
    direction: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Load factures data
  const {
    data: facturesData,
    isLoading: isLoadingQuery,
    error: facturesError,
  } = getFacturesQuery;

  useEffect(() => {
    if (facturesData) {
      setFactures(facturesData.factures ?? []);
      setErrorMessage(null);
    }
  }, [facturesData]);

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setPage(1);
  }, [filterText, sortConfig, factures.length]);

  const handleSort = (
    key:
      | "numero"
      | "codeGestio"
      | "adresse"
      | "ville"
      | "cp"
      | "dateEdition"
      | "montantHT"
      | "montantTTC"
      | "montantAPayer"
  ) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        // Inverse le sens ou réinitialise
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null; // troisième clic : tri désactivé
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (
    facture: Invoice,
    key:
      | "numero"
      | "codeGestio"
      | "adresse"
      | "ville"
      | "cp"
      | "dateEdition"
      | "montantHT"
      | "montantTTC"
      | "montantAPayer"
  ) => {
    switch (key) {
      case "numero":
        return facture.numero ?? "";
      case "codeGestio":
        return facture.codeGestio ?? "";
      case "adresse":
        return facture.adresse ?? "";
      case "ville":
        return facture.ville ?? "";
      case "cp":
        return facture.cp ?? "";
      case "dateEdition":
        return facture.dateEdition ?? facture.dateEditionFormatted ?? "";
      case "montantHT":
        return facture.montantTotalHT ?? facture.montantTotalHTFormatted ?? "";
      case "montantTTC":
        return facture.montantTotalTTC ?? facture.montantTotalTTCFormatted ?? "";
      case "montantAPayer":
        return (
          facture.montantTotalAPayer ?? facture.montantTotalAPayerFormatted ?? ""
        );
      default:
        return "";
    }
  };

  const displayedFactures = useMemo(() => {
    let data = [...factures];

    // Filtre texte global
    if (filterText.trim()) {
      const needle = filterText.toLowerCase();
      data = data.filter((f) => {
        const numero = (f.numero ?? "").toLowerCase();
        const codeGestio = (f.codeGestio ?? "").toLowerCase();
        const adresse = (f.adresse ?? "").toLowerCase();
        const ville = (f.ville ?? "").toLowerCase();
        const cp = (f.cp ?? "").toLowerCase();
        const dateEdition = (
          f.dateEditionFormatted ?? f.dateEdition ?? ""
        ).toLowerCase();
        const montantHT = (
          f.montantTotalHTFormatted ?? String(f.montantTotalHT ?? "")
        ).toLowerCase();
        const montantTTC = (
          f.montantTotalTTCFormatted ?? String(f.montantTotalTTC ?? "")
        ).toLowerCase();
        const montantAPayer = (
          f.montantTotalAPayerFormatted ??
          String(f.montantTotalAPayer ?? "")
        ).toLowerCase();

        return (
          numero.includes(needle) ||
          codeGestio.includes(needle) ||
          adresse.includes(needle) ||
          ville.includes(needle) ||
          cp.includes(needle) ||
          dateEdition.includes(needle) ||
          montantHT.includes(needle) ||
          montantTTC.includes(needle) ||
          montantAPayer.includes(needle)
        );
      });
    }

    // Tri
    if (sortConfig) {
      data.sort((a, b) => {
        const aVal = String(getSortableValue(a, sortConfig.key) ?? "");
        const bVal = String(getSortableValue(b, sortConfig.key) ?? "");
        if (aVal === bVal) return 0;
        const result = aVal.localeCompare(bVal, "fr", {
          numeric: true,
          sensitivity: "base",
        });
        return sortConfig.direction === "asc" ? result : -result;
      });
    }

    return data;
  }, [factures, filterText, sortConfig]);

  // Handle download
  const handleDownload = async (pkFacture: string) => {
    try {
      setDownloadingId(pkFacture);
      await downloadFacture(pkFacture);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg || "Une erreur s'est produite lors du téléchargement.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Show loading state
  if (isLoadingQuery) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement des factures...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (errorMessage || facturesError) {
    const errorMsg = errorMessage || (typeof facturesError === 'string' ? facturesError : facturesError?.message) || "Impossible de charger les factures.";
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des Factures
          </h3>
          {displayedFactures.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {displayedFactures.length} facture
              {displayedFactures.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrer (n° facture, ville, adresse...)"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4">
          <Alert variant="error" title="Erreur" message={errorMessage} />
        </div>
      )}

      {/* Pagination + table */}
      {(() => {
        const totalItems = displayedFactures.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const currentPage = Math.min(page, totalPages);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedFactures = displayedFactures.slice(startIndex, endIndex);

        if (totalItems === 0) {
          return (
            <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune facture disponible.
              </p>
            </div>
          );
        }

        return (
          <>
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("numero")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Numéro de facture</span>
                      {sortConfig?.key === "numero" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("codeGestio")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Code gestionnaire</span>
                      {sortConfig?.key === "codeGestio" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("adresse")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Adresse</span>
                      {sortConfig?.key === "adresse" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("ville")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Ville</span>
                      {sortConfig?.key === "ville" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("cp")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Code postal</span>
                      {sortConfig?.key === "cp" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("dateEdition")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Date d&apos;émission</span>
                      {sortConfig?.key === "dateEdition" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantHT")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Montant total HT</span>
                      {sortConfig?.key === "montantHT" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantTTC")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Montant total TTC</span>
                      {sortConfig?.key === "montantTTC" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantAPayer")}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <span>Montant total à payer</span>
                      {sortConfig?.key === "montantAPayer" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Télécharger
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedFactures.map((facture) => {
                  const pkFacture = facture.pkFacture;
                  const numero = facture.numero ?? "—";
                  const codeGestio = facture.codeGestio ?? "—";
                  const adresse = facture.adresse ?? "—";
                  const ville = facture.ville ?? "—";
                  const cp = facture.cp ?? "—";
                  const dateEdition =
                    facture.dateEditionFormatted ?? facture.dateEdition ?? "—";
                  const montantHT = facture.montantTotalHTFormatted ?? "—";
                  const montantTTC = facture.montantTotalTTCFormatted ?? "—";
                  const montantAPayer =
                    facture.montantTotalAPayerFormatted ?? "—";
                  const isDownloading = downloadingId === pkFacture;

                  return (
                    <TableRow key={pkFacture} className="align-top">
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {numero}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {codeGestio}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {adresse}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {ville}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {cp}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {dateEdition}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {montantHT}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {montantTTC}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">
                        {montantAPayer}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(pkFacture)}
                            disabled={isDownloading}
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
                                d="M8 10.6667V2.66667"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.33333 7.33333L8 10L10.6667 7.33333"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2.66667 13.3333H13.3333"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {isDownloading
                              ? "Téléchargement..."
                              : "Télécharger"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Affichage{" "}
                <span className="font-medium">
                  {startIndex + 1}-
                  {Math.min(endIndex, totalItems)}
                </span>{" "}
                sur <span className="font-medium">{totalItems}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </Button>
                <span>
                  Page{" "}
                  <span className="font-medium">
                    {currentPage}
                  </span>{" "}
                  / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Suivant
                </Button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

