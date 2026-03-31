"use client";
import { useMemo } from "react";
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

interface RawChartObject {
  label?: string | number;
  consoRaw?: string | number;
  conso?: string | number;
  indexRaw?: string | number;
  index?: string | number;
  valueRaw?: string | number;
  value?: string | number;
}

interface ParsedChartPoint {
  x: string | number;
  y: number;
  meta: string;
}

const toNumber = (value: string | number) =>
  typeof value === "number" ? value : Number(String(value).replace(",", "."));

const parseFrDateToMs = (value: string): number | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const ms = date.getTime();
  return Number.isNaN(ms) ? null : ms;
};

const formatDateLabel = (value?: string | number): string => {
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("fr-FR");
    }
    return value.toString();
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value.trim() !== "" && value.trim().length > 8) {
      const date = new Date(numericValue);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("fr-FR");
      }
    }
    return value;
  }

  return "";
};

const parseLogementChartValues = (rawValues?: unknown): { points: ParsedChartPoint[] } => {
  if (!Array.isArray(rawValues)) {
    return { points: [] };
  }

  const points: ParsedChartPoint[] = [];

  (rawValues as Array<RawChartEntry | RawChartObject>).forEach((entry) => {
    if (Array.isArray(entry)) {
      if (entry.length < 3) {
        return;
      }
      const [rawDate, rawHover, rawValue] = entry;
      const numericValue = typeof rawValue === "number" ? rawValue : toNumber(rawValue);
      if (Number.isNaN(numericValue)) {
        return;
      }
      const hoverValue =
        typeof rawHover === "number" ? rawHover.toString() : String(rawHover ?? "");
      const label = formatDateLabel(rawDate);
      points.push({
        x: parseFrDateToMs(label) ?? label,
        y: numericValue,
        meta: hoverValue,
      });
      return;
    }

    if (entry && typeof entry === "object") {
      const { label, consoRaw, conso, valueRaw, value } = entry as RawChartObject;
      const numericValueSource =
        conso ?? value ?? (entry as RawChartObject).index ?? (entry as RawChartObject).indexRaw;
      if (numericValueSource === undefined) {
        return;
      }
      const numericValue =
        typeof numericValueSource === "number"
          ? numericValueSource
          : toNumber(numericValueSource);
      if (Number.isNaN(numericValue)) {
        return;
      }
      const hoverValueSource = consoRaw ?? valueRaw ?? "";
      const hoverValue =
        typeof hoverValueSource === "number"
          ? hoverValueSource.toString()
          : String(hoverValueSource);
      const formattedLabel = formatDateLabel(label);
      if (!formattedLabel) {
        return;
      }
      points.push({
        x: parseFrDateToMs(formattedLabel) ?? formattedLabel,
        y: numericValue,
        meta: hoverValue,
      });
    }
  });

  return { points };
};

export default function LogementStatisticsConsommationChartConsoTabsRepart({ pkLogement }: LogementStatisticsChartProps) {
  const { useLogementQuery } = useLogements();
  const { data: logementData, isLoading, error } = useLogementQuery(pkLogement);

  const { points } = useMemo(() => {
    const rawValues = logementData?.consoTabs?.REPART?.EvolutionChartData?.data;
    return parseLogementChartValues(rawValues);
  }, [logementData]);

  const chartRange = useMemo(() => {
    const xs = points
      .map((point) => (typeof point.x === "number" ? point.x : parseFrDateToMs(point.x)))
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (!xs.length) {
      return { min: undefined, max: undefined };
    }
    const max = Math.max(...xs);
    const min = max - 365 * 24 * 60 * 60 * 1000;
    return { min, max };
  }, [points]);

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
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        autoScaleYaxis: true,
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
      type: "datetime",
      min: chartRange.min,
      max: chartRange.max,
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
  }), [chartRange.max, chartRange.min]);

  const series = useMemo(
    () => [
      {
        name: "Index Répartiteur",
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
        title="Evolution des index Répartiteur"
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
          message="Impossible de récupérer les index du répartiteur."
          showLink={false}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Evolution des index Répartiteur Conso
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
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Evolution des index Répartiteur Conso
          </h3>
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
