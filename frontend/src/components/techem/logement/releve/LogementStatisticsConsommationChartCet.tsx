"use client";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useLogements } from "@/lib/hooks/useLogements";
import { LoadingChart } from "@/components/ui/loading";

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

export default function LogementStatisticsConsommationChartCet({ pkLogement }: LogementStatisticsChartProps) {
  const { useLogementQuery } = useLogements();
  const { data: logementData, isLoading, error } = useLogementQuery(pkLogement);

  const { categories, points } = useMemo(() => {
    const rawValues = logementData?.logement?.LogementCETValues;
    return parseLogementChartValues(rawValues);
  }, [logementData]);

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
          colors: ["#1d1914"], // Color of the labels (Techem dark)
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
        name: "Index Compteur d'énergie",
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
        title="Evolution des index Compteur d'énergie"
        message="Chargement des index..."
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#1d1914] bg-white px-5 pb-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <div className="p-4 bg-[#b00511] text-white rounded-lg">
          <p className="font-medium mb-1">Erreur de chargement</p>
          <p className="text-sm">Impossible de récupérer les index du compteur.</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-xl border border-[#1d1914] bg-white px-5 pb-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Evolution des index Compteur d&apos;énergie
        </h3>
        <div className="mt-4 min-h-[160px] rounded-xl border border-dashed border-[#1d1914] flex items-center justify-center">
          <p className="text-base text-[#1d1914]">
            Aucune donnée de consommation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1d1914] bg-white px-5 pb-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-xl font-normal text-[#1d1914]">
            Evolution des index Compteur d&apos;énergie
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
