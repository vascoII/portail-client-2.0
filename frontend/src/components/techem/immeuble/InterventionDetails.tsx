"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api/client";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
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
        const root = (response as any).data?.data ?? (response as any).data ?? {};
        const immeubleSource =
          root.immeuble?.Immeuble ??
          root.logement?.Immeuble ??
          {};
        const immeuble = immeubleSource ?? {};
        const depannageInfo = root.depannage?.InfosDepannage ?? {};
        const logement = depannageInfo.Logement ?? {};
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
      <div className="flex items-center justify-center min-h-[200px] rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chargement des détails de l&apos;intervention...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Erreur"
        message={error || "Impossible de charger les détails de l'intervention."}
      />
    );
  }

  if (!data) {
    return (
      <Alert
        variant="warning"
        title="Aucune donnée"
        message="Aucune information d'intervention n'a été trouvée pour cette référence."
      />
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Détail de l&apos;intervention
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Numéro d&apos;intervention&nbsp;:&nbsp;
              <span className="font-medium text-gray-800 dark:text-white/90">
                {workOrderNumber}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {statut && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                Statut&nbsp;:&nbsp;{statut}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="mt-1"
            >
              {isExporting ? "Export en cours..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Référence client
            </h2>
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {clientRef || "—"}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Immeuble
            </h2>
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {immeubleNom || "—"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {immeubleAdresse1 || "—"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {[immeubleCp, immeubleVille].filter(Boolean).join(" ")}
            </p>
          </div>
        </div>
      </div>

      {exportError && (
        <Alert
          variant="error"
          title="Erreur d'export PDF"
          message={exportError}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Motif
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-100">
          {motif || "—"}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Compte rendu
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-100">
          {compteRendu || "—"}
        </p>
      </div>
    </div>
  );
}


