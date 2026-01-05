"use client";

import { useMemo, useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ParsedChartPoint {
  x: string;
  y: number;
  meta: string;
}

interface LogementStatisticsConsommationChartEfAppareilProps {
  numero: string;
  emplacement: string;
  valeursXYL: string;
}

const parseValeursXYL = (
  rawSerie?: string,
): { categories: string[]; points: ParsedChartPoint[] } => {
  const categories: string[] = [];
  const points: ParsedChartPoint[] = [];

  if (!rawSerie || typeof rawSerie !== "string") {
    return { categories, points };
  }

  rawSerie
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .forEach((segment) => {
      const parts = segment.split("|").map((item) => item?.trim() ?? "");
      const [rawDate, rawConso, rawIndex] = parts;

      if (!rawDate) {
        return;
      }

      const numericIndex =
        typeof rawIndex === "number"
          ? rawIndex
          : Number(String(rawIndex ?? "").replace(",", "."));

      if (Number.isNaN(numericIndex)) {
        return;
      }

      const consoValue = String(rawConso ?? "").replace(",", ".");

      categories.push(rawDate);
      points.push({
        x: rawDate,
        y: numericIndex,
        meta: consoValue || String(numericIndex),
      });
    });

  return { categories, points };
};

export default function LogementStatisticsConsommationChartEfAppareil({
  numero,
  emplacement,
  valeursXYL,
}: LogementStatisticsConsommationChartEfAppareilProps) {
  const { categories, points } = useMemo(
    () => parseValeursXYL(valeursXYL),
    [valeursXYL],
  );

  const hasData = points.length > 0;

  // Helpers to convert between "dd/MM/yyyy" and "yyyy-MM-dd"
  const toInputDate = (displayDate: string): string => {
    const [day, month, year] = displayDate.split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const toDisplayDate = (inputDate: string): string => {
    const [year, month, day] = inputDate.split("-");
    if (!day || !month || !year) return "";
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  };

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (!hasData) {
      setStartDate("");
      setEndDate("");
      return;
    }
    const first = categories[0];
    const last = categories[categories.length - 1];
    setStartDate(toInputDate(first));
    setEndDate(toInputDate(last));
  }, [hasData, categories]);

  const filteredPoints = useMemo(() => {
    if (!hasData || !startDate || !endDate) {
      return points;
    }

    const startDisplay = toDisplayDate(startDate);
    const endDisplay = toDisplayDate(endDate);

    const parseTs = (disp: string): number => {
      const [d, m, y] = disp.split("/");
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.getTime();
    };

    const startTs = parseTs(startDisplay);
    const endTs = parseTs(endDisplay);

    return points.filter((p) => {
      const ts = parseTs(p.x);
      return ts >= startTs && ts <= endTs;
    });
  }, [hasData, points, startDate, endDate]);

  const options: ApexOptions = useMemo(
    () => ({
      legend: {
        show: false,
        position: "top",
        horizontalAlign: "left",
      },
      colors: ["#465FFF", "#9CB9FF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 310,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "straight",
        width: [2, 2],
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
        },
      },
      markers: {
        size: 0,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value, { seriesIndex, dataPointIndex, w }) => {
            const point =
              w?.config?.series?.[seriesIndex]?.data?.[
                dataPointIndex
              ] as ParsedChartPoint | undefined;
            const tooltipValue = point?.meta ?? value;
            return typeof tooltipValue === "string"
              ? tooltipValue
              : `${tooltipValue}`;
          },
        },
      },
      xaxis: {
        type: "category",
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
        },
        title: {
          text: "",
          style: {
            fontSize: "0px",
          },
        },
      },
    }),
    [categories],
  );

  const series = useMemo(
    () => [
      {
        name: "Index Compteur",
        data: filteredPoints,
      },
    ],
    [filteredPoints],
  );

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Evolution des index - Compteur {numero} ({emplacement || "—"})
        </h3>
        <div className="mt-4 flex min-height-[160px] items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée de consommation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Evolution des index - Compteur {numero} ({emplacement || "—"})
          </h3>
        </div>
        {hasData && startDate && endDate && (
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-500 dark:text-gray-400">
                Du
              </label>
              <input
                type="date"
                value={startDate}
                min={toInputDate(categories[0])}
                max={toInputDate(categories[categories.length - 1])}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-500 dark:text-gray-400">
                Au
              </label>
              <input
                type="date"
                value={endDate}
                min={toInputDate(categories[0])}
                max={toInputDate(categories[categories.length - 1])}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
          </div>
        )}
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
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


