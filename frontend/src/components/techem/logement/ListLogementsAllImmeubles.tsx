 "use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaFaucet, FaChartBar, FaBolt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Alert from "@/components/ui/alert/Alert";
import { LoadingTable } from "@/components/ui/loading";
import StatusIconsAlerte from "@/components/techem/images/StatusIconsAlerte";
import StatusIconsAnomalie from "@/components/techem/images/StatusIconsAnomalie";
import StatusIconsDysfonctionnement from "@/components/techem/images/StatusIconsDysfonctionnement";
import StatusIconsFuite from "@/components/techem/images/StatusIconsFuite";

interface SearchLogementEntry {
  Immeuble?: Record<string, unknown>;
  immeuble?: Record<string, unknown>;
  Logement?: Record<string, unknown>;
  logement?: Record<string, unknown>;
  Occupant?: Record<string, unknown>;
  occupant?: Record<string, unknown>;
  [key: string]: unknown;
}

interface NormalizedRow {
  immeuble: Record<string, unknown> | null;
  logement: Record<string, unknown> | null;
  occupant: Record<string, unknown> | null;
  raw: SearchLogementEntry;
}

function toStringSafe(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function toNumberSafe(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default function ListLogementsAllImmeubles() {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchLogementEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const raw = window.sessionStorage.getItem("search_logements_results");
      if (!raw) {
        if (isMounted) {
          setEntries([]);
          setIsLoading(false);
        }
        return;
      }

      const parsed = JSON.parse(raw) as SearchLogementEntry[] | unknown;
      const list = Array.isArray(parsed) ? parsed : [];

      if (isMounted) {
        setEntries(list);
        setIsLoading(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error reading search_logements_results:", error);
      if (isMounted) {
        setEntries([]);
        setLoadingError(
          "Impossible de charger les résultats de recherche. Veuillez réessayer.",
        );
        setIsLoading(false);
      }
    } finally {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("search_logements_results");
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const rows: NormalizedRow[] = useMemo(() => {
    return entries.map((item) => {
      const immeuble =
        (item.Immeuble as Record<string, unknown> | undefined) ??
        (item.immeuble as Record<string, unknown> | undefined) ??
        null;
      const logement =
        (item.Logement as Record<string, unknown> | undefined) ??
        (item.logement as Record<string, unknown> | undefined) ??
        null;
      const occupant =
        (item.Occupant as Record<string, unknown> | undefined) ??
        (item.occupant as Record<string, unknown> | undefined) ??
        null;

      return {
        immeuble,
        logement,
        occupant,
        raw: item,
      };
    });
  }, [entries]);

  const getPkImmeuble = (immeuble: Record<string, unknown> | null): string | null => {
    if (!immeuble) return null;
    return (
      toStringSafe(immeuble.PkImmeuble) ||
      toStringSafe((immeuble as any).pkImmeuble) || // eslint-disable-line @typescript-eslint/no-explicit-any
      null
    );
  };

  const getPkLogement = (logement: Record<string, unknown> | null): string | null => {
    if (!logement) return null;
    return (
      toStringSafe(logement.PkLogement) ||
      toStringSafe((logement as any).pkLogement) || // eslint-disable-line @typescript-eslint/no-explicit-any
      null
    );
  };

  const getOccupantName = (occupant: Record<string, unknown> | null): string => {
    if (!occupant) return "—";
    return (
      toStringSafe(occupant.Nom) ||
      toStringSafe((occupant as any).nom) || // eslint-disable-line @typescript-eslint/no-explicit-any
      "—"
    );
  };

  const getLogementEtage = (logement: Record<string, unknown> | null): string => {
    if (!logement) return "";
    return (
      toStringSafe(logement.NumEtage) ||
      toStringSafe((logement as any).numEtage) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getLogementBatiment = (logement: Record<string, unknown> | null): string => {
    if (!logement) return "";
    return (
      toStringSafe(logement.NumBatiment) ||
      toStringSafe((logement as any).numBatiment) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getLogementEscalier = (logement: Record<string, unknown> | null): string => {
    if (!logement) return "";
    return (
      toStringSafe(logement.NumEscalier) ||
      toStringSafe((logement as any).numEscalier) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getLogementNumOrdre = (logement: Record<string, unknown> | null): string => {
    if (!logement) return "";
    return (
      toStringSafe(logement.NumOrdre) ||
      toStringSafe((logement as any).numOrdre) ||
      toStringSafe(logement.Numero) ||
      toStringSafe((logement as any).numero) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getImmeubleRef = (immeuble: Record<string, unknown> | null): string => {
    if (!immeuble) return "";
    return (
      toStringSafe(immeuble.Ref) ||
      toStringSafe((immeuble as any).ref) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getImmeubleNumero = (immeuble: Record<string, unknown> | null): string => {
    if (!immeuble) return "";
    return (
      toStringSafe(immeuble.Numero) ||
      toStringSafe((immeuble as any).numero) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const formatAddress = (immeuble: Record<string, unknown> | null): string => {
    if (!immeuble) return "";
    const adresse =
      toStringSafe(immeuble.Adresse1) ||
      toStringSafe((immeuble as any).adresse1); // eslint-disable-line @typescript-eslint/no-explicit-any
    const cp = toStringSafe(immeuble.Cp) || toStringSafe((immeuble as any).cp); // eslint-disable-line @typescript-eslint/no-explicit-any
    const ville =
      toStringSafe(immeuble.Ville) || toStringSafe((immeuble as any).ville); // eslint-disable-line @typescript-eslint/no-explicit-any
    return [adresse, [cp, ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  };

  const getNbCompteursEF = (entry: SearchLogementEntry): number => {
    return (
      toNumberSafe(entry.NbCompteursEF) ||
      toNumberSafe((entry as any).nbCompteursEF) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getNbCompteursEC = (entry: SearchLogementEntry): number => {
    return (
      toNumberSafe(entry.NbCompteursEC) ||
      toNumberSafe((entry as any).nbCompteursEC) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getNbCompteursRepart = (entry: SearchLogementEntry): number => {
    return (
      toNumberSafe(entry.NbCompteursRepart) ||
      toNumberSafe((entry as any).nbCompteursRepart) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getNbCompteursCET = (entry: SearchLogementEntry): number => {
    return (
      toNumberSafe(entry.NbCompteursCET) ||
      toNumberSafe((entry as any).nbCompteursCET) // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  };

  const getIssues = (entry: SearchLogementEntry) => {
    return {
      nbAnomalies:
        toNumberSafe(entry.NbAnomalies) ||
        toNumberSafe((entry as any).nbAnomalies), // eslint-disable-line @typescript-eslint/no-explicit-any
      nbFuites:
        toNumberSafe(entry.NbFuites) ||
        toNumberSafe((entry as any).nbFuites), // eslint-disable-line @typescript-eslint/no-explicit-any
      nbDepannages:
        toNumberSafe(entry.NbDepannages) ||
        toNumberSafe((entry as any).nbDepannages), // eslint-disable-line @typescript-eslint/no-explicit-any
      nbDysfonctionnements:
        toNumberSafe(entry.NbDysfonctionnements) ||
        toNumberSafe((entry as any).nbDysfonctionnements), // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString("fr-FR");
  };

  if (isLoading) {
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
            title="Erreur"
            message={loadingError}
            showLink={false}
          />
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Résultats de recherche - Logements
        </h3>
        {rows.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {rows.length} logement{rows.length > 1 ? "s" : ""} trouvé
            {rows.length > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div className="max-w-full overflow-x-auto">
        {rows.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun résultat de recherche à afficher.
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
                  Logement
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaFaucet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Eau</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaChartBar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Répartiteurs</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaBolt className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>Compteurs d&apos;énergie</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Statut
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row, index) => {
                const { immeuble, logement, occupant, raw } = row;
                const pkImmeuble = getPkImmeuble(immeuble);
                const pkLogement = getPkLogement(logement);
                const occupantName = getOccupantName(occupant);
                const etage = getLogementEtage(logement);
                const batiment = getLogementBatiment(logement);
                const escalier = getLogementEscalier(logement);
                const numOrdre = getLogementNumOrdre(logement);
                const immeubleRef = getImmeubleRef(immeuble);
                const immeubleNumero = getImmeubleNumero(immeuble);

                const nbEF = getNbCompteursEF(raw);
                const nbEC = getNbCompteursEC(raw);
                const nbRepart = getNbCompteursRepart(raw);
                const nbCET = getNbCompteursCET(raw);
                const issues = getIssues(raw);

                const hasIssues =
                  issues.nbAnomalies > 0 ||
                  issues.nbFuites > 0 ||
                  issues.nbDepannages > 0 ||
                  issues.nbDysfonctionnements > 0;

                const handleRowClick = () => {
                  if (pkImmeuble && pkLogement) {
                    router.push(
                      `/immeuble/${pkImmeuble}/logements/${String(pkLogement)}`,
                    );
                  }
                };

                const key = pkLogement ?? `${index}-${occupantName}`;

                return (
                  <TableRow
                    key={key}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    onClick={handleRowClick}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                          <svg
                            className="h-5 w-5 text-gray-400"
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
                        <div className="min-w-0 flex-1">
                          <div className="space-y-1">
                            {(batiment ||
                              escalier ||
                              etage ||
                              numOrdre) && (
                              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                {batiment && (
                                  <>
                                    Bât.:{" "}
                                    <span className="font-normal">
                                      {batiment}
                                    </span>
                                  </>
                                )}
                                {batiment && escalier && " "}
                                {escalier && (
                                  <>
                                    Esc.:{" "}
                                    <span className="font-normal">
                                      {escalier}
                                    </span>
                                  </>
                                )}
                                {(batiment || escalier) &&
                                  (etage || numOrdre) &&
                                  " "}
                                {etage && (
                                  <>
                                    Étage:{" "}
                                    <span className="font-normal">
                                      {etage}
                                    </span>
                                  </>
                                )}
                                {etage && numOrdre && " "}
                                {numOrdre && (
                                  <>
                                    N° logement:{" "}
                                    <span className="font-normal">
                                      {numOrdre}
                                    </span>
                                  </>
                                )}
                              </p>
                            )}
                            {occupantName && occupantName !== "—" && (
                              <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                                {occupantName}
                              </p>
                            )}
                            {(immeubleRef || immeubleNumero || immeuble) && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {immeubleRef && (
                                  <>
                                    Réf immeuble:{" "}
                                    <span className="font-medium">
                                      {immeubleRef}
                                    </span>
                                  </>
                                )}
                                {immeubleRef && immeubleNumero && " "}
                                {immeubleNumero && (
                                  <>
                                    N°:{" "}
                                    <span className="font-medium">
                                      {immeubleNumero}
                                    </span>
                                  </>
                                )}
                                <br />
                                {formatAddress(immeuble)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-theme-sm text-gray-700 dark:text-gray-200">
                          {formatNumber(nbEF + nbEC)}
                        </span>
                        {nbEF + nbEC > 0 && (
                          <FaFaucet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-theme-sm text-gray-700 dark:text-gray-200">
                          {formatNumber(nbRepart)}
                        </span>
                        {nbRepart > 0 && (
                          <FaChartBar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-theme-sm text-gray-700 dark:text-gray-200">
                          {formatNumber(nbCET)}
                        </span>
                        {nbCET > 0 && (
                          <FaBolt className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                      {!hasIssues ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          OK
                        </span>
                      ) : (
                        <div className="grid w-20 grid-cols-2 gap-2">
                          {/* Dysfonctionnements */}
                          {issues.nbDysfonctionnements > 0 ? (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsDysfonctionnement
                                size={20}
                                className="text-error-500 dark:text-error-400"
                                color="currentColor"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsDysfonctionnement
                                size={20}
                                className="text-gray-400 dark:text-gray-500"
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Dépannages */}
                          {issues.nbDepannages > 0 ? (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsAlerte
                                size={20}
                                className="text-warning-500 dark:text-warning-400"
                                color="currentColor"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsAlerte
                                size={20}
                                className="text-gray-400 dark:text-gray-500"
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Fuites */}
                          {issues.nbFuites > 0 ? (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsFuite
                                size={20}
                                className="text-blue-500 dark:text-blue-400"
                                color="currentColor"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsFuite
                                size={20}
                                className="text-gray-400 dark:text-gray-500"
                                color="currentColor"
                              />
                            </div>
                          )}

                          {/* Anomalies */}
                          {issues.nbAnomalies > 0 ? (
                            <div className="flex items-center justify-center p-1">
                              <StatusIconsAnomalie
                                size={20}
                                className="text-warning-500 dark:text-warning-400"
                                color="currentColor"
                              />
                            </div>
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
    </div>
  );
}

