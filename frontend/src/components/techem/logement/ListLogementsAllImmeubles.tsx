"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Housing, Building } from "@/lib/types/api";
import Alert from "@/components/ui/alert/Alert";
import { LoadingTable } from "@/components/ui/loading";

interface LogementSearchItem {
  infosLogement?: Housing;
  logement?: Housing;
  immeuble?: Building;
  Immeuble?: Building;
  [key: string]: unknown;
}

export default function ListLogementsAllImmeubles() {
  const router = useRouter();
  const [logements, setLogements] = useState<LogementSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFromSession = () => {
      try {
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const raw = window.sessionStorage.getItem("search_logements_results");
        if (!raw) {
          if (isMounted) {
            setLogements([]);
            setIsLoading(false);
          }
          return;
        }

        const parsed = JSON.parse(raw) as LogementSearchItem[] | Housing[];

        let items: LogementSearchItem[] = [];

        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && "infosLogement" in parsed[0]) {
            items = parsed as LogementSearchItem[];
          } else {
            items = (parsed as Housing[]).map((h) => ({
              infosLogement: h,
            }));
          }
        }

        if (isMounted) {
          setLogements(items);
          setIsLoading(false);
        }

        window.sessionStorage.removeItem("search_logements_results");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error reading search_logements_results:", error);
        if (isMounted) {
          setLoadingError(
            "Impossible de charger les résultats de recherche. Veuillez réessayer.",
          );
          setLogements([]);
          setIsLoading(false);
        }
      }
    };

    loadFromSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedLogements = useMemo(() => {
    return logements.map((item) => {
      const logement =
        (item.infosLogement as Housing | undefined) ||
        (item.logement as Housing | undefined) ||
        (item as unknown as Housing);
      const immeuble =
        (item.immeuble as Building | undefined) ||
        (item.Immeuble as Building | undefined) ||
        (logement?.Immeuble as Building | undefined);
      return { logement, immeuble };
    });
  }, [logements]);

  const formatAddress = (immeuble?: Building): string => {
    if (!immeuble) return "";
    const adresse =
      immeuble.Adresse1 ??
      (immeuble as any).adresse1 ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      "";
    const cp = immeuble.Cp ?? (immeuble as any).cp ?? ""; // eslint-disable-line @typescript-eslint/no-explicit-any
    const ville = immeuble.Ville ?? (immeuble as any).ville ?? ""; // eslint-disable-line @typescript-eslint/no-explicit-any
    return [adresse, [cp, ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  };

  const getPkLogement = (logement?: Housing): string | null => {
    if (!logement) return null;
    return (
      logement.PkLogement ??
      (logement as any).pkLogement ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      null
    );
  };

  const getPkImmeuble = (immeuble?: Building): string | null => {
    if (!immeuble) return null;
    return (
      (immeuble as any).PkImmeuble ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      (immeuble as any).pkImmeuble ?? // eslint-disable-line @typescript-eslint/no-explicit-any
      null
    );
  };

  const getOccupantName = (logement?: Housing): string => {
    if (!logement) return "—";
    const occupant = (logement as any).Occupant ?? (logement as any).occupant; // eslint-disable-line @typescript-eslint/no-explicit-any
    return occupant?.Nom ?? occupant?.nom ?? "—";
  };

  const getLogementNumOrdre = (logement?: Housing): string => {
    if (!logement) return "";
    const logementObj = (logement as any).Logement ?? logement; // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
      logementObj?.NumOrdre ??
      logementObj?.numOrdre ??
      logementObj?.Numero ??
      logementObj?.numero ??
      ""
    );
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
        {normalizedLogements.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {normalizedLogements.length} logement
            {normalizedLogements.length > 1 ? "s" : ""} trouvé
            {normalizedLogements.length > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div className="max-w-full overflow-x-auto">
        {normalizedLogements.length === 0 ? (
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
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Occupant
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Immeuble
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {normalizedLogements.map(({ logement, immeuble }, index) => {
                const pkLogement = getPkLogement(logement);
                const pkImmeuble = getPkImmeuble(immeuble);
                const occupantName = getOccupantName(logement);
                const numOrdre = getLogementNumOrdre(logement);
                const immeubleRef =
                  (immeuble as any)?.Ref ?? (immeuble as any)?.ref ?? ""; // eslint-disable-line @typescript-eslint/no-explicit-any
                const immeubleNumero =
                  (immeuble as any)?.Numero ?? (immeuble as any)?.numero ?? ""; // eslint-disable-line @typescript-eslint/no-explicit-any

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
                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-100">
                      {numOrdre ? `N° logement: ${numOrdre}` : "Logement"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-100">
                      {occupantName}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-100">
                      <div className="space-y-1">
                        {(immeubleRef || immeubleNumero) && (
                          <p>
                            {immeubleRef && (
                              <>
                                Réf: <span className="font-medium">{immeubleRef}</span>
                              </>
                            )}
                            {immeubleRef && immeubleNumero && " "}
                            {immeubleNumero && (
                              <>
                                N°: <span className="font-medium">{immeubleNumero}</span>
                              </>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatAddress(immeuble)}
                        </p>
                      </div>
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

