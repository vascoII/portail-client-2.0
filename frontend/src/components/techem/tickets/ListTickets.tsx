"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTickets } from "@/lib/hooks/useTickets";
import type { Ticket } from "@/lib/types/api";
import { useExport } from "@/lib/hooks/useExport";

type SortKey =
  | "caseNumber"
  | "dateDemande"
  | "demandeur"
  | "objet"
  | "immeuble"
  | "occupant"
  | "refLogement"
  | "statut"
  | "lastUpdate"
  | "depannage";

export default function ListTickets() {
  const { useTicketsQuery, closeTicket, isClosing, closeError, exportTickets } = useTickets();

  // Chargement des tickets "Tous" (showall=O) et "Actif" (showall=N)
  const {
    data: ticketsTousData,
    isLoading: ticketsTousIsLoading,
    error: ticketsTousError,
  } = useTicketsQuery({ showAll: true });

  const {
    data: ticketsActifData,
    isLoading: ticketsActifIsLoading,
    error: ticketsActifError,
  } = useTicketsQuery({ showAll: false });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  // Onglet par défaut: "Actif"
  const [selectedStatus, setSelectedStatus] = useState<string>("Actif");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Excel export
  const exportExcelFn = async () => {
    await exportTickets();
  };

  const {
    handleExport: handleExportExcel,
    isExporting,
    error: exportError,
    clearError: clearExportError,
  } = useExport(exportExcelFn, {
    errorTitle: "Erreur d'export Excel",
  });

  // Load tickets from appropriate query based on selected tab
  useEffect(() => {
    if (selectedStatus === "Tous") {
      if (ticketsTousData) {
        setTickets(ticketsTousData.tickets ?? []);
        setErrorMessage(null);
      } else if (ticketsTousError) {
        setErrorMessage("Impossible de charger les tickets (Tous).");
        setTickets([]);
      }
    } else {
      if (ticketsActifData) {
        setTickets(ticketsActifData.tickets ?? []);
        setErrorMessage(null);
      } else if (ticketsActifError) {
        setErrorMessage("Impossible de charger les tickets (Actif).");
        setTickets([]);
      }
    }
  }, [selectedStatus, ticketsTousData, ticketsActifData, ticketsTousError, ticketsActifError]);

  // Reset pagination when filters, status or sorting change
  useEffect(() => {
    setPage(1);
  }, [filterText, selectedStatus, sortConfig, tickets.length]);

  // Onglets fixes : Tous / Actif / + déclinaisons filtrées d'Actif
  const allStatuses = useMemo(
    () => ["Tous", "Actif", "Nouveau", "Ouvert", "Intervention planifiés", "Clos"],
    []
  );

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (ticket: Ticket, key: SortKey) => {
    switch (key) {
      case "caseNumber":
        return ticket.CaseNumber ?? "";
      case "dateDemande":
        return ticket.TicketDate ?? "";
      case "demandeur":
        return `${ticket.WebUser_Nom ?? ""} ${ticket.WebUser_Prenom ?? ""}`.trim();
      case "objet":
        return ticket.ObjetRetour ?? "";
      case "immeuble":
        return ticket.Imm_Id ?? "";
      case "occupant":
        return ticket.Nom ?? "";
      case "refLogement":
        return ticket.RefLogement ?? "";
      case "statut":
        return ticket.Statut ?? "";
      case "lastUpdate":
        return ticket.LastUpdateDate ?? "";
      case "depannage":
        return ticket.NumIntervention ?? "";
      default:
        return "";
    }
  };

  const displayedTickets = useMemo(() => {
    let data = [...tickets];

    // Onglet par statut (avec fusion des statuts "Clos ..." et mapping simple)
    // "Actif" = aucun filtre supplémentaire (tous les tickets actifs)
    if (selectedStatus !== "Tous" && selectedStatus !== "Actif") {
      data = data.filter((t) => {
        const raw = (t.Statut ?? "").toString().trim();
        const lower = raw.toLowerCase();

        if (selectedStatus === "Clos") {
          return lower.startsWith("clos");
        }
        if (selectedStatus === "Nouveau") {
          return lower.startsWith("nouveau");
        }
        if (selectedStatus === "Intervention planifiés") {
          return lower.startsWith("intervention planif");
        }
        if (selectedStatus === "Ouvert") {
          return !lower.startsWith("clos");
        }
        return raw === selectedStatus;
      });
    }

    // Filtre texte global
    if (filterText.trim()) {
      const needle = filterText.toLowerCase();
      data = data.filter((t) => {
        const caseNumber = (t.CaseNumber ?? "").toLowerCase();
        const refLogement = (t.RefLogement ?? "").toLowerCase();
        const nom = (t.Nom ?? "").toLowerCase();
        const email = (t.Email ?? "").toLowerCase();
        const tel =
          (t.TelFixe ?? "").toLowerCase() +
          " " +
          (t.TelMobile ?? "").toLowerCase();
        const statut = (t.Statut ?? "").toLowerCase();
        const objet = (t.ObjetRetour ?? "").toLowerCase();

        return (
          caseNumber.includes(needle) ||
          refLogement.includes(needle) ||
          nom.includes(needle) ||
          email.includes(needle) ||
          tel.includes(needle) ||
          statut.includes(needle) ||
          objet.includes(needle)
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
  }, [tickets, filterText, selectedStatus, sortConfig]);

  const isLoading =
    selectedStatus === "Tous" ? ticketsTousIsLoading : ticketsActifIsLoading;

  const currentTicketsError =
    selectedStatus === "Tous" ? ticketsTousError : ticketsActifError;

  // Show loading state
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-3 pt-4 sm:px-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[#1d1914]">
            Chargement des tickets...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (errorMessage || currentTicketsError) {
    const errorMsg =
      errorMessage ||
      (typeof currentTicketsError === "string"
        ? currentTicketsError
        : (currentTicketsError as any)?.message) || // eslint-disable-line @typescript-eslint/no-explicit-any
      "Impossible de charger les tickets.";
    return (
      <div className="overflow-hidden rounded-xl border border-[#b00511] bg-[#b00511] px-4 py-6 sm:px-6">
        <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
          <p className="font-medium mb-1">Erreur</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-4 pb-3 pt-4 sm:px-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-normal text-[#1d1914]">
            Liste des Tickets
          </h3>
          {displayedTickets.length > 0 && (
            <p className="text-base text-[#1d1914] mt-1">
              {displayedTickets.length} ticket
              {displayedTickets.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="w-full sm:w-52">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrer (statut, n° ticket, logement...)"
              className="h-10 w-full rounded-lg border border-[#1d1914] bg-white px-3 py-2 text-sm text-[#1d1914] placeholder:text-[#6a6a6a] focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterText("")}
              className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] text-sm font-normal"
            >
              Réinitialiser filtre
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting || displayedTickets.length === 0}
              className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none text-sm font-normal"
            >
              {isExporting ? "Export en cours..." : "Export Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {(errorMessage || exportError || closeError) && (
        <div className="mb-9">
          <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
            <p className="font-medium mb-1">Erreur</p>
            <p className="text-sm">
              {errorMessage ??
              exportError?.message ??
              (typeof closeError === "string" ? closeError : "") ??
              ""}
            </p>
          </div>
          {exportError && (
            <button
              type="button"
              onClick={clearExportError}
              className="mt-2 text-xs text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
            >
              Fermer
            </button>
          )}
        </div>
      )}

      {/* Onglets par statut */}
      {allStatuses.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2 border-b border-[#1d1914] pb-2">
          {allStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all duration-300 ${
                selectedStatus === status
                  ? "bg-[#e20613] text-white border-[#e20613]"
                  : "bg-[#e9ecef] text-[#1d1914] border-[#1d1914] hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Pagination + table */}
      {(() => {
        const totalItems = displayedTickets.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const currentPage = Math.min(page, totalPages);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTickets = displayedTickets.slice(startIndex, endIndex);

        if (totalItems === 0) {
          return (
            <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-[#1d1914]">
              <p className="text-base text-[#1d1914]">
                Aucun ticket disponible.
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
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("caseNumber")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Numéro de ticket</span>
                      {sortConfig?.key === "caseNumber" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("dateDemande")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Date de demande</span>
                      {sortConfig?.key === "dateDemande" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("demandeur")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Demandeur</span>
                      {sortConfig?.key === "demandeur" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("objet")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Objet</span>
                      {sortConfig?.key === "objet" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("immeuble")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Immeuble</span>
                      {sortConfig?.key === "immeuble" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("occupant")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Nom occupant</span>
                      {sortConfig?.key === "occupant" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("refLogement")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Réf. logement</span>
                      {sortConfig?.key === "refLogement" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("statut")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Statut</span>
                      {sortConfig?.key === "statut" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("lastUpdate")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Dernière modification</span>
                      {sortConfig?.key === "lastUpdate" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("depannage")}
                      className="inline-flex items-center gap-1 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                    >
                      <span>Dépannage</span>
                      {sortConfig?.key === "depannage" && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  {selectedStatus === "Clos" && (
                    <TableCell
                      isHeader
                      className="py-3 text-start text-xs font-medium text-[#1d1914] select-none"
                    >
                      Action
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-[#1d1914]">
                {paginatedTickets.map((ticket) => {
                  const caseNumber = ticket.CaseNumber ?? "—";
                  const ticketDate = ticket.TicketDate
                    ? new Date(ticket.TicketDate).toLocaleDateString("fr-FR")
                    : "—";
                  const lastUpdate = ticket.LastUpdateDate
                    ? new Date(ticket.LastUpdateDate).toLocaleDateString("fr-FR")
                    : "—";
                  const demandeur = `${
                    ticket.WebUser_Nom ?? ""
                  } ${ticket.WebUser_Prenom ?? ""}`.trim() || "—";
                  const objet = ticket.ObjetRetour ?? "—";
                  const immeuble = ticket.Imm_Id ?? "—";
                  const occupant = ticket.Nom ?? "—";
                  const refLogement = ticket.RefLogement ?? "—";
                  const statut = ticket.Statut ?? "—";
                  const numIntervention =
                    ticket.NumIntervention &&
                    ticket.NumIntervention !== "''" &&
                    ticket.NumIntervention.trim().length > 0
                      ? ticket.NumIntervention
                      : null;
                  const fkImmeuble = ticket.FkImmeuble;

                  return (
                    <TableRow
                      key={caseNumber + String(ticket.CaseId)}
                      className="align-top"
                    >
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {caseNumber}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {ticketDate}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {demandeur}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {objet}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {immeuble}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {occupant}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {refLogement}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {statut}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {lastUpdate}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#1d1914]">
                        {numIntervention && fkImmeuble ? (
                          <Link
                            href={`/immeuble/${fkImmeuble}/interventions/${numIntervention}`}
                            className="text-[#b00511] hover:text-[#e20613] hover:underline transition-all duration-300"
                          >
                            {numIntervention}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      {selectedStatus === "Clos" && (
                        <TableCell className="py-4 text-sm text-[#1d1914]">
                          <button
                            type="button"
                            disabled={!ticket.CaseId || isClosing}
                            onClick={() => {
                              if (ticket.CaseId) {
                                void closeTicket(String(ticket.CaseId));
                              }
                            }}
                            className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none text-sm font-normal"
                          >
                            {isClosing ? "Clôture..." : "Clôture"}
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="mt-4 flex items-center justify-between text-xs text-[#1d1914]">
              <span>
                Affichage{" "}
                <span className="font-medium">
                  {startIndex + 1}-
                  {Math.min(endIndex, totalItems)}
                </span>{" "}
                sur <span className="font-medium">{totalItems}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none text-sm font-normal"
                >
                  Précédent
                </button>
                <span>
                  Page{" "}
                  <span className="font-medium">
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
                  className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:border-[#adb5bd] disabled:text-[#adb5bd] disabled:pointer-events-none text-sm font-normal"
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

