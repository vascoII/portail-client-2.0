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
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-3 pt-4 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-[#1d1914]">
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
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 py-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
        <div className="p-4 bg-[#b00511] text-white rounded-lg">
          <p className="font-medium mb-1">Erreur</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-3 pt-4 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-normal text-[#1d1914]">
            Liste des Factures
          </h3>
          {displayedFactures.length > 0 && (
            <p className="text-sm text-[#1d1914] mt-1">
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
            className="h-10 w-full rounded-lg border border-[#1d1914] bg-white px-3 py-2 text-sm text-[#1d1914] placeholder:text-[#6a6a6a] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
          />
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4">
          <div className="p-4 bg-[#b00511] text-white rounded-lg">
            <p className="font-medium mb-1">Erreur</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
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
            <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-[#1d1914]">
              <p className="text-base text-[#1d1914]">
                Aucune facture disponible.
              </p>
            </div>
          );
        }

        return (
          <>
            <Table>
              <TableHeader className="border-y border-[#1d1914]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("numero")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("codeGestio")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("adresse")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("ville")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("cp")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("dateEdition")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantHT")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantTTC")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-start text-sm font-normal text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("montantAPayer")}
                      className="inline-flex items-center gap-1 hover:text-[#e20613] transition-all duration-300"
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
                    className="py-3 text-center text-sm font-normal text-[#1d1914]"
                  >
                    Télécharger
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-[#1d1914]">
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
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {numero}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {codeGestio}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {adresse}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {ville}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {cp}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {dateEdition}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {montantHT}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {montantTTC}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {montantAPayer}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDownload(pkFacture)}
                            disabled={isDownloading}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal transition-all duration-300 ${
                              isDownloading
                                ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                                : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613] cursor-pointer"
                            }`}
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
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="mt-4 flex items-center justify-between text-sm text-[#1d1914]">
              <span>
                Affichage{" "}
                <span className="font-normal">
                  {startIndex + 1}-
                  {Math.min(endIndex, totalItems)}
                </span>{" "}
                sur <span className="font-normal">{totalItems}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                      : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613] cursor-pointer"
                  }`}
                >
                  Précédent
                </button>
                <span>
                  Page{" "}
                  <span className="font-normal">
                    {currentPage}
                  </span>{" "}
                  / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={`px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                      : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613] cursor-pointer"
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

