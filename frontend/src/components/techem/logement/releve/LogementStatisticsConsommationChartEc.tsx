"use client";
import { useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingChart } from "@/components/ui/loading";
import Alert from "@/components/ui/alert/Alert";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface LogementStatisticsChartProps {
  pkLogement: string;
}

type RawChartEntry = [string, string | number, string | number];

interface ParsedChartPoint {
  x: string;
  y: number;
  meta: string;
}

const toNumber = (value: string | number) =>
  typeof value === "number" ? value : Number(String(value).replace(",", "."));

const parseLogementChartValues = (rawValues?: unknown): { categories: string[]; points: ParsedChartPoint[] } => {
  if (!Array.isArray(rawValues)) {
    return { categories: [], points: [] };
  }

  const categories: string[] = [];
  const points: ParsedChartPoint[] = [];

  (rawValues as RawChartEntry[]).forEach((entry) => {
    if (!Array.isArray(entry) || entry.length < 3) {
      return;
    }

    const [rawDate, rawHover, rawValue] = entry;
    if (typeof rawDate !== "string") {
      return;
    }

    const numericValue =
      typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(",", "."));

    if (Number.isNaN(numericValue)) {
      return;
    }

    const hoverValue =
      typeof rawHover === "number" ? rawHover.toString() : String(rawHover ?? "");

    categories.push(rawDate);
    points.push({
      x: rawDate,
      y: numericValue,
      meta: hoverValue,
    });
  });

  return { categories, points };
};

const parseValeursXYLIndexValues = (rawSerie?: string): { categories: string[]; points: ParsedChartPoint[] } => {
  if (!rawSerie || typeof rawSerie !== "string") {
    return { categories: [], points: [] };
  }

  const categories: string[] = [];
  const points: ParsedChartPoint[] = [];

  rawSerie
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .forEach((segment) => {
      const [dateRaw, consoRaw, indexRaw] = segment.split("|").map((value) => value?.trim() ?? "");
      if (!dateRaw || !indexRaw) {
        return;
      }

      const numericIndex = toNumber(indexRaw);
      if (Number.isNaN(numericIndex)) {
        return;
      }

      categories.push(dateRaw);
      points.push({
        x: dateRaw,
        y: numericIndex,
        meta: consoRaw || indexRaw,
      });
    });

  return { categories, points };
};

export default function LogementStatisticsConsommationChartEc({ pkLogement }: LogementStatisticsChartProps) {
  const { useLogementQuery } = useLogements();
  const { data: logementData, isLoading, error } = useLogementQuery(pkLogement);

  const meters = useMemo(() => {
    const logement = logementData?.logement as Record<string, unknown> | undefined;
    const logementEC =
      logement && typeof logement === "object" && "LogementEC" in logement
        ? (logement.LogementEC as Record<string, unknown> | undefined)
        : null;

    const infos =
      logementEC &&
      typeof logementEC === "object" &&
      "ListeInfosAppareils" in logementEC &&
      logementEC.ListeInfosAppareils &&
      typeof logementEC.ListeInfosAppareils === "object" &&
      "infosAppareilEAU" in (logementEC.ListeInfosAppareils as Record<string, unknown>) &&
      Array.isArray((logementEC.ListeInfosAppareils as Record<string, unknown>).infosAppareilEAU)
        ? ((logementEC.ListeInfosAppareils as Record<string, unknown>).infosAppareilEAU as Array<Record<string, unknown>>)
        : [];

    return infos
      .map((item) => {
        const appareil = (item?.Appareil ?? null) as Record<string, unknown> | null;
        const numero = typeof appareil?.Numero === "string" ? appareil.Numero : "";
        const emplacement = typeof appareil?.Emplacement === "string" ? appareil.Emplacement : "";
        const fluide = typeof appareil?.Fluide === "string" ? appareil.Fluide : "";
        const typeAppareil = typeof appareil?.TypeAppareil === "string" ? appareil.TypeAppareil : "";
        const serieConsos = (item?.SerieConsos ?? null) as Record<string, unknown> | null;
        const valeursXYL = typeof serieConsos?.ValeursXYL === "string" ? serieConsos.ValeursXYL : "";

        const isEc = fluide === "EC" || typeAppareil === "EC";
        if (!isEc || !numero) {
          return null;
        }

        return {
          id: numero,
          label: emplacement ? `${emplacement} - ${numero}` : numero,
          valeursXYL,
        };
      })
      .filter(Boolean) as Array<{ id: string; label: string; valeursXYL: string }>;
  }, [logementData]);

  const [selectedMeterId, setSelectedMeterId] = useState<string>("");

  useEffect(() => {
    if (!meters.length) {
      if (selectedMeterId) {
        setSelectedMeterId("");
      }
      return;
    }

    const exists = meters.some((meter) => meter.id === selectedMeterId);
    if (!exists) {
      setSelectedMeterId(meters[0].id);
    }
  }, [meters, selectedMeterId]);

  const { categories, points } = useMemo(() => {
    const selectedMeter = selectedMeterId ? meters.find((m) => m.id === selectedMeterId) : undefined;
    if (selectedMeter?.valeursXYL) {
      return parseValeursXYLIndexValues(selectedMeter.valeursXYL);
    }

    const rawValues = logementData?.logement?.LogementECValues;
    return parseLogementChartValues(rawValues);
  }, [logementData, meters, selectedMeterId]);

  const hasData = points.length > 0;

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], // Define line colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "straight", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value, { seriesIndex, dataPointIndex, w }) => {
          const point =
            w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex] as ParsedChartPoint | undefined;
          const tooltipValue = point?.meta ?? value;
          return typeof tooltipValue === "string" ? tooltipValue : `${tooltipValue}`;
        },
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  }), [categories]);

  const series = useMemo(
    () => [
      {
        name: "Index Compteur",
        data: points,
      },
    ],
    [points]
  );

  if (isLoading) {
    return (
      <LoadingChart
        variant="line"
        height={310}
        title="Evolution des index Compteur Eau chaude"
        message="Chargement des index..."
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <Alert
          variant="error"
          title="Erreur de chargement"
          message="Impossible de récupérer les index du compteur."
          showLink={false}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Evolution des index Compteur Eau chaude
        </h3>
        <div className="mt-4 min-h-[160px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée de consommation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Evolution des index Compteur Eau chaude
          </h3>
          {meters.length > 1 && (
            <div className="sm:max-w-[320px]">
              <select
                value={selectedMeterId}
                onChange={(e) => setSelectedMeterId(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-brand-800"
              >
                {meters.map((meter) => (
                  <option key={meter.id} value={meter.id}>
                    {meter.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
