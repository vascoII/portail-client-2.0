"use client";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingChart } from "@/components/ui/loading";
import Alert from "@/components/ui/alert/Alert";
import type { TabType } from "@/components/techem/immeuble/ImmeubleReleves";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ImmeubleStatisticsConsommationChartProps {
  pkImmeuble: string;
  selectedTab: TabType;
}

type ParsedSerie = {
  points: { date: string; value: number }[];
};

type SerieMetadata = ParsedSerie & { yearLabel?: string };

const parseSerie = (
  rawSerie?: string,
  year?: string
): SerieMetadata => {
  const points: { date: string; value: number }[] = [];

  if (!rawSerie) {
    return { points, yearLabel: year };
  }

  rawSerie
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .forEach((segment) => {
      const [date, volume] = segment.split("|");
      if (!date) {
        return;
      }
      const numericVolume = Number((volume ?? "").replace(",", "."));
      if (Number.isNaN(numericVolume)) {
        return;
      }
      points.push({ date, value: numericVolume });
    });

  return { points, yearLabel: year };
};

const buildCategories = (serie1: ParsedSerie, serie2: ParsedSerie): string[] => {
  const orderedDates: string[] = [];
  const seen = new Set<string>();

  const addPoints = (points: ParsedSerie["points"]) => {
    points.forEach(({ date }) => {
      if (!seen.has(date)) {
        seen.add(date);
        orderedDates.push(date);
      }
    });
  };

  addPoints(serie1.points);
  addPoints(serie2.points);

  return orderedDates;
};

const mapValuesToCategories = (
  categories: string[],
  serie: ParsedSerie
): (number | null)[] => {
  const valueMap = new Map<string, number>();
  serie.points.forEach(({ date, value }) => {
    valueMap.set(date, value);
  });

  return categories.map((date) => valueMap.get(date) ?? null);
};

export default function ImmeubleStatisticsConsommationChart({
  pkImmeuble,
  selectedTab,
}: ImmeubleStatisticsConsommationChartProps) {
  const { getImmeubleQuery } = useImmeubles();
  const {
    data: immeubleData,
    isLoading,
    error,
  } = getImmeubleQuery(pkImmeuble);

  const isWaterTab = selectedTab === "eauFroide" || selectedTab === "eauChaude";

  const { serie1, serie2, categories } = useMemo(() => {
    type SerieConsosNode = {
      SerieConsos1?: { ValeursXYL?: string; Annee?: string };
      SerieConsos2?: { ValeursXYL?: string; Annee?: string };
    };

    const details = immeubleData?.immeuble as
      | (SerieConsosNode & {
          ImmeubleEC?: SerieConsosNode;
          ImmeubleEF?: SerieConsosNode;
        })
      | undefined;

    const baseNode =
      selectedTab === "eauChaude"
        ? details?.ImmeubleEC
        : details?.ImmeubleEF;

    const fallbackNode = details;

    const serie1Raw = baseNode?.SerieConsos1 ?? fallbackNode?.SerieConsos1;
    const serie2Raw = baseNode?.SerieConsos2 ?? fallbackNode?.SerieConsos2;

    const parsedSerie1 = parseSerie(
      serie1Raw?.ValeursXYL,
      serie1Raw?.Annee
    );
    const parsedSerie2 = parseSerie(
      serie2Raw?.ValeursXYL,
      serie2Raw?.Annee
    );

    return {
      serie1: parsedSerie1,
      serie2: parsedSerie2,
      categories: buildCategories(parsedSerie1, parsedSerie2),
    };
  }, [immeubleData, selectedTab]);

  const hasData =
    categories.length > 0 &&
    (serie1.points.length > 0 || serie2.points.length > 0);

  const series = useMemo(() => {
    const serie1Values = mapValuesToCategories(categories, serie1);
    const serie2Values = mapValuesToCategories(categories, serie2);

    return [
      {
        name: serie1.yearLabel
          ? `Consommation ${serie1.yearLabel}`
          : "Consommation 1",
        data: serie1Values,
      },
      {
        name: serie2.yearLabel
          ? `Consommation ${serie2.yearLabel}`
          : "Consommation 2",
        data: serie2Values,
      },
    ];
  }, [categories, serie1, serie2]);

  const options: ApexOptions = useMemo(() => {
    return {
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
      },
      colors: ["#465FFF", "#9CB9FF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 310,
        type: "area",
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
        x: {
          show: true,
        },
        y: {
          formatter: (value: number) =>
            `${value.toLocaleString("fr-FR")} m³`,
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
        labels: {
          rotate: -45,
          style: {
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
          formatter: (val) => val.toFixed(0),
        },
        title: {
          text: "Volume (m³)",
          style: {
            fontSize: "12px",
          },
        },
      },
    };
  }, [categories]);

  if (!isWaterTab) {
    return null;
  }

  if (isLoading) {
    return (
      <LoadingChart
        variant="line"
        height={310}
        title="Evolution des consommations"
        message="Chargement des données..."
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <Alert
          variant="error"
          title="Erreur de chargement"
          message="Impossible de récupérer l'évolution des consommations."
          showLink={false}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Evolution des consommations
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée de série disponible pour cet immeuble.
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
            Evolution des consommations
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
