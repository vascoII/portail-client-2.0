"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api/client";
import { useInterventions } from "@/lib/hooks/useInterventions";

interface InterventionDetailsProps {
  pkImmeuble?: string;
  pkIntervention: string;
  fkOccupant?: string | number;
  mode?: "immeuble" | "occupant";
}

interface ParsedIntervention {
  workOrderNumber: string;
  clientRef: string;
  immeubleNom: string;
  immeubleAdresse1: string;
  immeubleCp: string;
  immeubleVille: string;
  statut: string;
  motif: string;
  compteRendu: string;
}

export default function InterventionDetails({
  pkImmeuble,
  pkIntervention,
  fkOccupant,
  mode = "immeuble",
}: InterventionDetailsProps) {
  const [data, setData] = useState<ParsedIntervention | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { getInterventionReport } = useInterventions();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url =
          mode === "occupant" && fkOccupant
            ? `/occupant/${fkOccupant}/interventions/${pkIntervention}`
            : `/immeubles/${pkImmeuble}/interventions/${pkIntervention}`;

        const response = await api.get(url);

        // API returns: { success, status, data: { immeuble/logement, depannage } }
        const root = (response as any).data?.data ?? (response as any).data ?? {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        const immeubleSource =
          root.immeuble?.Immeuble ??
          root.logement?.Immeuble ??
          {};
        const immeuble = immeubleSource ?? {};
        const depannageInfo = root.depannage?.InfosDepannage ?? {};
        const logement = depannageInfo.Logement ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
        const occupant = depannageInfo.Occupant ?? {};
        const depannage = depannageInfo.Depannage ?? {};

        const parsed: ParsedIntervention = {
          workOrderNumber: depannage.WorkOrderNumber ?? depannage.Numero ?? pkIntervention,
          clientRef: occupant.Ref ?? "",
          immeubleNom: immeuble.Nom ?? "",
          immeubleAdresse1: immeuble.Adresse1 ?? "",
          immeubleCp: immeuble.Cp ?? "",
          immeubleVille: immeuble.Ville ?? "",
          statut: depannage.Statut ?? "",
          motif: depannage.Motif ?? "",
          compteRendu: depannage.CompteRendu ?? "",
        };

        if (!cancelled) {
          setData(parsed);
        }
      } catch (e) {
        if (!cancelled) {
          setError(handleApiError(e));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    // In occupant mode, wait for fkOccupant to be available
    if (mode === "occupant" && !fkOccupant) {
      setIsLoading(false);
      setError("Identifiant occupant manquant pour charger l'intervention.");
      return;
    }

    fetchData().catch(() => {
      // error handled in catch
    });

    return () => {
      cancelled = true;
    };
  }, [pkImmeuble, pkIntervention, fkOccupant, mode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-[#1d1914] bg-white px-6 py-8 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
        <p className="text-sm text-[#1d1914]">
          Chargement des détails de l&apos;intervention...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#b00511] text-white rounded-lg">
        <p className="font-medium mb-1">Erreur</p>
        <p className="text-sm">{error || "Impossible de charger les détails de l'intervention."}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-[#ffe5e6] border border-[#1d1914] text-[#1d1914] rounded-lg">
        <p className="font-medium mb-1">Aucune donnée</p>
        <p className="text-sm">Aucune information d&apos;intervention n&apos;a été trouvée pour cette référence.</p>
      </div>
    );
  }

  const {
    workOrderNumber,
    clientRef,
    immeubleNom,
    immeubleAdresse1,
    immeubleCp,
    immeubleVille,
    statut,
    motif,
    compteRendu,
  } = data;

  const handleExportPdf = async () => {
    try {
      setExportError(null);
      setIsExporting(true);
      await getInterventionReport(pkIntervention);
    } catch (e) {
      setExportError(handleApiError(e));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-6 py-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-normal text-[#1d1914]">
              Détail de l&apos;intervention
            </h1>
            <p className="mt-1 text-sm text-[#1d1914]">
              Numéro d&apos;intervention&nbsp;:&nbsp;
              <span className="font-normal text-[#1d1914]">
                {workOrderNumber}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {statut && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-normal ${
                statut.toLowerCase() === "realise" 
                  ? "bg-[#417232] text-white"
                  : statut.toLowerCase() === "nonrealise"
                  ? "bg-[#e20613] text-white"
                  : "bg-[#e9ecef] text-[#1d1914]"
              }`}>
                Statut&nbsp;:&nbsp;{statut}
              </span>
            )}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className={`px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal transition-all duration-300 ${
                isExporting
                  ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                  : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613]"
              }`}
            >
              {isExporting ? "Export en cours..." : "Export PDF"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-normal text-[#1d1914]">
              Référence client
            </h2>
            <p className="text-sm text-[#1d1914]">
              {clientRef || "—"}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-normal text-[#1d1914]">
              Immeuble
            </h2>
            <p className="text-sm text-[#1d1914]">
              {immeubleNom || "—"}
            </p>
            <p className="text-sm text-[#1d1914]">
              {immeubleAdresse1 || "—"}
            </p>
            <p className="text-sm text-[#1d1914]">
              {[immeubleCp, immeubleVille].filter(Boolean).join(" ")}
            </p>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="p-4 bg-[#b00511] text-white rounded-lg">
          <p className="font-medium mb-1">Erreur d&apos;export PDF</p>
          <p className="text-sm">{exportError}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-6 py-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
        <h2 className="text-sm font-normal text-[#1d1914]">
          Motif
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-[#1d1914]">
          {motif || "—"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-6 py-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
        <h2 className="text-sm font-normal text-[#1d1914]">
          Compte rendu
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-[#1d1914]">
          {compteRendu || "—"}
        </p>
      </div>
    </div>
  );
}


