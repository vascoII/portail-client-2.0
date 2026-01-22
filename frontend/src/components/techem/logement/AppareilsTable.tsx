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
  pkImmeuble, // eslint-disable-line @typescript-eslint/no-unused-vars
  appareils: localAppareils,
}: AppareilsTableProps) {
  const { useInfosAppareilsQuery } = useLogements();
  const { data, isLoading, error } = useInfosAppareilsQuery(pkLogement, type);

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
        <p className="text-base text-[#1d1914]">
          Aucun appareil trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-[#1d1914] border-y">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 font-normal text-[#1d1914] text-start text-sm"
            >
              N° de compteur
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-normal text-[#1d1914] text-start text-sm"
            >
              Emplacement
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-normal text-[#1d1914] text-start text-sm"
            >
              Index
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-normal text-[#1d1914] text-start text-sm"
            >
              Conso
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#1d1914]">
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
              <TableRow key={index} className="hover:bg-[#ffe5e6] transition-all duration-300">
                <TableCell className="py-3">
                  <strong className="text-[#1d1914] text-sm font-normal">
                    {numero}
                  </strong>
                </TableCell>
                <TableCell className="py-3 text-[#1d1914] text-sm">
                  {emplacement}
                </TableCell>
                <TableCell className="py-3">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" color="gray" />
                      <span className="text-xs text-[#6a6a6a]">Chargement...</span>
                    </div>
                  ) : error ? (
                    <span className="text-xs text-[#b00511]">Erreur</span>
                  ) : (
                    <strong className="text-[#1d1914] text-sm font-normal">
                      {indexValue || "—"}
                    </strong>
                  )}
                </TableCell>
                <TableCell className="py-3 text-[#1d1914] text-sm">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" color="gray" />
                      <span className="text-xs text-[#6a6a6a]">Chargement...</span>
                    </div>
                  ) : error ? (
                    <span className="text-xs text-[#b00511]">Erreur</span>
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

