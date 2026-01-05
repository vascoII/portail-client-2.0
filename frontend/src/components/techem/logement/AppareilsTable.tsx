"use client";
import { useLogements } from "@/lib/hooks/useLogements";
import type { AppareilInfo, Device } from "@/lib/types/api";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppareilsTableProps {
  pkLogement: string | number;
  type: "eau" | "chauffage";
  pkImmeuble: string;
  appareils: Device[];
}

export default function AppareilsTable({
  pkLogement,
  type,
  pkImmeuble,
  appareils: localAppareils,
}: AppareilsTableProps) {
  const { getInfosAppareilsQuery } = useLogements();
  const { data, isLoading, error } = getInfosAppareilsQuery(pkLogement, type);

  // Check if date is valid (not 0001-01-01)
  const isValidDate = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    return dateStr !== "0001-01-01T00:00:00" && dateStr !== "0001-01-01";
  };

  // Create a map of appareils from API by PkAppareil and Numero
  const appareilsMapByPk = new Map<string | number, AppareilInfo>();
  const appareilsMapByNumero = new Map<string, AppareilInfo>();
  if (data?.appareils) {
    data.appareils.forEach((appInfo) => {
      const device = appInfo.Appareil ?? appInfo.appareil;
      const pkAppareil = device?.PkAppareil ?? device?.pkAppareil;
      const numero = device?.Numero ?? device?.numero;
      if (pkAppareil) {
        appareilsMapByPk.set(String(pkAppareil), appInfo);
      }
      if (numero) {
        appareilsMapByNumero.set(String(numero), appInfo);
      }
    });
  }

  if (localAppareils.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucun appareil trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              N° de compteur
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Emplacement
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Index
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Conso
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {localAppareils.map((appareil, index) => {
            const pkAppareil = appareil.PkAppareil ?? appareil.pkAppareil ?? "";
            const numero = appareil.Numero ?? appareil.numero ?? "";
            const emplacement = appareil.Emplacement ?? appareil.emplacement ?? "";
            
            // Get API data for this appareil (try by PkAppareil first, then by Numero)
            const apiAppareil = appareilsMapByPk.get(String(pkAppareil)) ?? appareilsMapByNumero.get(String(numero));
            const r1 = apiAppareil?.R1 ?? apiAppareil?.r1;
            const hasValidR1 = r1 && isValidDate(r1.DateReleve);
            const indexValue = hasValidR1 ? (r1.Index ?? r1.index ?? "") : "";
            const consoValue = hasValidR1 ? (r1.Conso ?? r1.conso ?? "") : "";

            return (
              <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <TableCell className="py-3">
                  <strong className="text-gray-800 dark:text-white/90 text-theme-sm">
                    {numero}
                  </strong>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {emplacement}
                </TableCell>
                <TableCell className="py-3">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" color="gray" />
                      <span className="text-xs text-gray-400">Chargement...</span>
                    </div>
                  ) : error ? (
                    <span className="text-xs text-red-500">Erreur</span>
                  ) : (
                    <strong className="text-gray-800 dark:text-white/90 text-theme-sm">
                      {indexValue || "—"}
                    </strong>
                  )}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" color="gray" />
                      <span className="text-xs text-gray-400">Chargement...</span>
                    </div>
                  ) : error ? (
                    <span className="text-xs text-red-500">Erreur</span>
                  ) : (
                    consoValue || "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

