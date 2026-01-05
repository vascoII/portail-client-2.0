import { useQuery } from "@tanstack/react-query";
import { api, extractApiData, handleApiError } from "@/lib/api/client";
import { getStaleTimeUntilMidnight } from "@/lib/utils/cache";
import type { ChantierData } from "@/lib/types/api";

export interface ParcBoardData {
  erreur?: string;
  info?: string;
  nbImmeubles: number;
  nbImmeublesTelereleve: number;
  nbImmeublesTransfertFichiers: number;
  nbCompteursARelever: number;
  nbCompteursReleves: number;
  nbLogements: number;
  nbCompteurs: number;
  nbCompteursEc: number;
  nbCompteursEf: number;
  nbCompteursRepart: number;
  nbCompteursCet: number;
  nbCompteursCapteur: number;
  nbCompteursElect: number;
  nbCompteursGaz: number;
  nbFuites: number;
  degresFuites: number;
  nbDepannages: number;
  degresDepannages: number;
  nbDysfonctionnements: number;
  degresDysfonctionnements: number;
  nbAnomalies: number;
  degresAnomalies: number;
  nbChantiers: number;
  nbCompteursPoses: number;
  nbCompteursCommandes: number;
  pcImmeublesTelereleve: number;
  pcImmeublesTransfertFichiers: number;
}

export interface ParcApiResponse {
  board: ParcBoardData;
  chantier: ChantierData;
  demo?: boolean;
}

type ParcApiRawResponse = {
  board?: Record<string, unknown>;
  chantier?: Partial<ChantierData> | Record<string, unknown>;
  demo?: boolean;
};

const BOARD_FIELD_MAP: Record<keyof ParcBoardData, [string, string]> = {
  erreur: ["erreur", "Erreur"],
  info: ["info", "Info"],
  nbImmeubles: ["nbImmeubles", "NbImmeubles"],
  nbImmeublesTelereleve: ["nbImmeublesTelereleve", "NbImmeublesTelereleve"],
  nbImmeublesTransfertFichiers: ["nbImmeublesTransfertFichiers", "NbImmeublesTransfertFichiers"],
  nbCompteursARelever: ["nbCompteursARelever", "NbCompteursARelever"],
  nbCompteursReleves: ["nbCompteursReleves", "NbCompteursReleves"],
  nbLogements: ["nbLogements", "NbLogements"],
  nbCompteurs: ["nbCompteurs", "NbCompteurs"],
  nbCompteursEc: ["nbCompteursEc", "NbCompteursEC"],
  nbCompteursEf: ["nbCompteursEf", "NbCompteursEF"],
  nbCompteursRepart: ["nbCompteursRepart", "NbCompteursRepart"],
  nbCompteursCet: ["nbCompteursCet", "NbCompteursCET"],
  nbCompteursCapteur: ["nbCompteursCapteur", "NbCompteursCapteur"],
  nbCompteursElect: ["nbCompteursElect", "NbCompteursElect"],
  nbCompteursGaz: ["nbCompteursGaz", "NbCompteursGaz"],
  nbFuites: ["nbFuites", "NbFuites"],
  degresFuites: ["degresFuites", "DegresFuites"],
  nbDepannages: ["nbDepannages", "NbDepannages"],
  degresDepannages: ["degresDepannages", "DegresDepannages"],
  nbDysfonctionnements: ["nbDysfonctionnements", "NbDysfonctionnements"],
  degresDysfonctionnements: ["degresDysfonctionnements", "DegresDysfonctionnements"],
  nbAnomalies: ["nbAnomalies", "NbAnomalies"],
  degresAnomalies: ["degresAnomalies", "DegresAnomalies"],
  nbChantiers: ["nbChantiers", "NbChantiers"],
  nbCompteursPoses: ["nbCompteursPoses", "NbCompteursPoses"],
  nbCompteursCommandes: ["nbCompteursCommandes", "NbCompteursCommandes"],
  pcImmeublesTelereleve: ["pcImmeublesTelereleve", "PcImmeublesTelereleve"],
  pcImmeublesTransfertFichiers: ["pcImmeublesTransfertFichiers", "PcImmeublesTransfertFichiers"],
};

const normalizeNumber = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const normalizeParcBoard = (board?: Record<string, unknown>): ParcBoardData => {
  const normalized: Partial<ParcBoardData> = {};

  (Object.keys(BOARD_FIELD_MAP) as Array<keyof ParcBoardData>).forEach((key) => {
    const [camel, pascal] = BOARD_FIELD_MAP[key];

    if (key === "erreur" || key === "info") {
      const stringValue = board?.[camel] ?? board?.[pascal];
      normalized[key] = typeof stringValue === "string" ? stringValue : "";
      return;
    }

    normalized[key] = normalizeNumber(board?.[camel] ?? board?.[pascal]);
  });

  return normalized as ParcBoardData;
};

const normalizeChantier = (chantier?: Partial<ChantierData> | Record<string, unknown>): ChantierData => {
  const source = chantier ?? {};
  return {
    installed: normalizeNumber(source.installed ?? (source as any).Installed),
    installed_percent: normalizeNumber(source.installed_percent ?? (source as any).Installed_percent ?? (source as any).InstalledPercent),
    remaining: normalizeNumber(source.remaining ?? (source as any).Remaining),
    remaining_percent: normalizeNumber(source.remaining_percent ?? (source as any).Remaining_percent ?? (source as any).RemainingPercent),
    total: normalizeNumber(source.total ?? (source as any).Total),
    date: (source.date ?? (source as any).Date ?? null) as string | null,
  };
};

const normalizeParcResponse = (raw?: ParcApiRawResponse): ParcApiResponse => {
  return {
    board: normalizeParcBoard(raw?.board),
    chantier: normalizeChantier(raw?.chantier),
    demo: raw?.demo ?? false,
  };
};

export function useParc() {
  const parcQuery = useQuery({
    queryKey: ["parc"],
    queryFn: async (): Promise<ParcApiResponse> => {
      const response = await api.get<{ success: boolean; data: ParcApiRawResponse }>("/parc");
      const raw = extractApiData<ParcApiRawResponse>(response);
      return normalizeParcResponse(raw);
    },
    retry: false,
    staleTime: getStaleTimeUntilMidnight(),
  });

  return {
    parcData: parcQuery.data,
    isParcLoading: parcQuery.isLoading,
    parcError: parcQuery.error ? handleApiError(parcQuery.error) : null,
  };
}

