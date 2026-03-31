"use client";
import { useMemo, useCallback } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingChart } from "@/components/ui/loading";
import Alert from "@/components/ui/alert/Alert";
import { api, handleApiError } from "@/lib/api/client";
import { useExport } from "@/lib/hooks/useExport";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface LogementConsommationChartRepartProps {
  pkLogement: string;
}

const readingOrder: Array<"R5" | "R4" | "R3" | "R2" | "R1"> = ["R5", "R4", "R3", "R2", "R1"];

const formatDateLabel = (dateValue?: string, fallback?: string) => {
  if (!dateValue) {
    return fallback ?? "";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback ?? dateValue;
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const parseConsoPeriodeReadings = (
  consoPeriode?: Record<"R1" | "R2" | "R3" | "R4" | "R5", { DateReleve?: string; Conso?: string | number }>
) => {
  const categories: string[] = [];
  const values: number[] = [];

  if (!consoPeriode) {
    return { categories, values };
  }

  readingOrder.forEach((readingKey) => {
    const reading = consoPeriode[readingKey];
    if (!reading) {
      return;
    }

    const label = formatDateLabel(reading.DateReleve, readingKey);
    const rawValue = reading.Conso ?? "";
    const numericValue =
      typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(",", "."));

    if (Number.isNaN(numericValue)) {
      return;
    }

    categories.push(label);
    values.push(numericValue);
  });

  return { categories, values };
};

const parseSerieConsos = (rawSerie?: string) => {
  const categories: string[] = [];
  const values: number[] = [];

  if (!rawSerie) {
    return { categories, values };
  }

  rawSerie
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .forEach((segment) => {
      const [date, volume] = segment.split("|").map((item) => item?.trim() ?? "");
      if (!date) {
        return;
      }
      const numericVolume = Number((volume || "").replace(",", "."));
      if (Number.isNaN(numericVolume)) {
        return;
      }
      categories.push(date);
      values.push(numericVolume);
    });

  return { categories, values };
};

export default function LogementConsommationChartRepart({ pkLogement }: LogementConsommationChartRepartProps) {
  const { useLogementQuery } = useLogements();
  const {
    data: logementData,
    isLoading,
    error,
  } = useLogementQuery(pkLogement);

  const { categories, values, lastRepart } = useMemo(() => {
    const logement = logementData?.logement as Record<string, unknown> | undefined;
    const logementRepart =
      logement && typeof logement === "object" && "LogementRepart" in logement
        ? (logement.LogementRepart as Record<string, unknown> | undefined)
        : null;

    const consoPeriode =
      logementRepart && typeof logementRepart === "object" && "ConsoPeriode" in logementRepart
        ? (logementRepart.ConsoPeriode as Record<
            "R1" | "R2" | "R3" | "R4" | "R5",
            { DateReleve?: string; Conso?: string | number }
          >)
        : undefined;

    const parsed = parseConsoPeriodeReadings(consoPeriode);

    if (parsed.categories.length && parsed.values.length) {
      return {
        ...parsed,
        lastRepart: logementRepart,
      };
    }

    const serieConsosDJU =
      logementRepart && typeof logementRepart === "object" && "SerieConsosDJU" in logementRepart
        ? (logementRepart.SerieConsosDJU as { ValeursXYL?: string } | undefined)
        : null;
    const rawSerie = serieConsosDJU?.ValeursXYL ?? "";
    const parsedSerie = parseSerieConsos(rawSerie);

    return {
      ...parsedSerie,
      lastRepart: logementRepart,
    };
  }, [logementData]);

  const lastRepartStats = useMemo(() => {
    const toNumber = (value: unknown) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const formatInteger = (value: unknown) => {
      const numeric = toNumber(value);
      if (numeric === null) return "—";
      return Math.round(numeric).toLocaleString("fr-FR");
    };

    const formatEuro = (value: unknown, decimals = 2) => {
      const numeric = toNumber(value);
      if (numeric === null) return "—";
      return `${numeric.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })} €`;
    };

    const formatEuroUnit = (value: unknown, decimals = 5) => formatEuro(value, decimals);

    const source = lastRepart;
    if (!source || typeof source !== "object") {
      return null;
    }

    const repart = source as Record<string, unknown>;

    return {
      totURepart: formatInteger(repart.Tot_URepart),
      totTantChauff: formatInteger(repart.Tot_TantChauff),
      puTant: formatEuroUnit(repart.PU_Tant, 5),
      prixURepart: formatEuroUnit(repart.Prix_URepart, 5),
      prixAbonn: formatEuro(repart.Prix_Abonn, 2),
      montARepartTant: formatEuro(repart.Mont_ARepartTant, 2),
      partRepartConsos: formatEuro(repart.Part_RepartConsos, 2),
      ctCombust: formatEuro(repart.CT_Combust, 2),
      tantLog: formatInteger(repart.TantLog),
      ctChauffLog: formatEuro(repart.CT_ChauffLog, 2),
    };
  }, [lastRepart]);

  const downloadReleveRepart = useCallback(async () => {
    try {
      if (!pkLogement) {
        throw new Error("Identifiant logement manquant pour l'export du relevé répartiteur.");
      }

      const response = await api.get(`/logements/${pkLogement}/releve-repart`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data as unknown as BlobPart], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logement-${pkLogement}-releve-repart.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = handleApiError(err);
      throw new Error(message || "Erreur lors de l'export du relevé répartiteur.");
    }
  }, [pkLogement]);

  const {
    handleExport: handleReleveExport,
    isExporting: isReleveExporting,
    error: releveError,
    clearError: clearReleveError,
  } = useExport(downloadReleveRepart, { errorTitle: "Erreur export relevé répartiteur" });

  const hasData = values.length > 0 && categories.length > 0;

  const options: ApexOptions = useMemo(() => {
    return {
      colors: ["#465fff"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 180,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "39%",
          borderRadius: 5,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 4,
        colors: ["transparent"],
      },
      xaxis: {
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: "11px",
          },
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Outfit",
      },
      yaxis: {
        title: {
          text: "Volume (m³)",
        },
        labels: {
          formatter: (value) => value.toFixed(0),
        },
      },
      grid: {
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: true,
        },
        y: {
          formatter: (val: number) => `${val.toLocaleString("fr-FR")} m³`,
        },
      },
    };
  }, [categories]);

  const series = useMemo(
    () => [
      {
        name: "Consommations récentes (m³)",
        data: values,
      },
    ],
    [values]
  );

  if (isLoading) {
    return (
      <LoadingChart
        variant="bar"
        height={200}
        title="Compteur Répartiteur"
        message="Chargement des consommations..."
      />
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <Alert
          variant="error"
          title="Erreur de chargement"
          message="Impossible de récupérer les données de consommation."
          showLink={false}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        {releveError && (
          <div className="mb-3">
            <Alert
              variant={releveError.variant || "error"}
              title={releveError.title}
              message={releveError.message}
              showLink={false}
            />
            <button
              type="button"
              onClick={clearReleveError}
              className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Fermer
            </button>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Compteur Répartiteur
        </h3>
        <div className="flex items-center justify-center min-h-[160px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800 mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée de consommation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {releveError && (
        <div className="mb-3">
          <Alert
            variant={releveError.variant || "error"}
            title={releveError.title}
            message={releveError.message}
            showLink={false}
          />
          <button
            type="button"
            onClick={clearReleveError}
            className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Fermer
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Compteur Répartiteur
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Information consommation + variation entre deux relevés
          </p>
        </div>
        {pkLogement && (
          <button
            type="button"
            onClick={handleReleveExport}
            disabled={isReleveExporting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.05]"
          >
            <span>{isReleveExporting ? "Export en cours..." : "Export PDF"}</span>
          </button>
        )}
      </div>

      {lastRepartStats && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <h4 className="text-sm font-semibold tracking-wide text-gray-800 dark:text-white/90">
            DONNÉES DE LA DERNIÈRE RÉPARTITION
          </h4>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                Données de l&apos;immeuble
              </h5>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total des unités de répartition de l&apos;immeuble
                  </span>
                  <span className="font-semibold">{lastRepartStats.totURepart}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Total tantièmes chauffage</span>
                  <span className="font-semibold">{lastRepartStats.totTantChauff}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Prix unitaire du tantième</span>
                  <span className="font-semibold">{lastRepartStats.puTant}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Prix de l&apos;unité de répartition</span>
                  <span className="font-semibold">{lastRepartStats.prixURepart}</span>
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-200 lg:pl-6 dark:lg:border-gray-800">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                &nbsp;
              </h5>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Prix de l&apos;abonnement</span>
                  <span className="font-semibold">{lastRepartStats.prixAbonn}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Montant à répartir aux tantièmes
                  </span>
                  <span className="font-semibold">{lastRepartStats.montARepartTant}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">
                    Part répartie en fonction des consommations
                  </span>
                  <span className="font-semibold">{lastRepartStats.partRepartConsos}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Coût total hors combustible</span>
                  <span className="font-semibold">{lastRepartStats.ctCombust}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">
              Données du logement
            </h5>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200 lg:grid-cols-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-600 dark:text-gray-400">Tantièmes logement</span>
                <span className="font-semibold">{lastRepartStats.tantLog}</span>
              </div>
              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <span className="text-gray-600 dark:text-gray-400">Coût du chauffage</span>
                <span className="font-semibold">{lastRepartStats.ctChauffLog}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
