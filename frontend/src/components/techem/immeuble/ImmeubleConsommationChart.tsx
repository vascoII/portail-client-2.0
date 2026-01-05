"use client";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingChart } from "@/components/ui/loading";
import Alert from "@/components/ui/alert/Alert";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ImmeubleConsommationChartProps {
  pkImmeuble: string;
}

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

export default function ImmeubleConsommationChart({
  pkImmeuble,
}: ImmeubleConsommationChartProps) {
  const { getImmeubleQuery } = useImmeubles();
  const {
    data: immeubleData,
    isLoading,
    error,
  } = getImmeubleQuery(pkImmeuble);

  const { categories, values } = useMemo(() => {
    type SerieConsosEAUShape = {
      SerieConsosEAU?: {
        ValeursXYL?: string;
      };
    };
    const immeubleDetails = immeubleData?.immeuble as SerieConsosEAUShape | undefined;
    const rawSerie = immeubleDetails?.SerieConsosEAU?.ValeursXYL ?? "";
    return parseSerieConsos(rawSerie);
  }, [immeubleData]);

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
        name: "Consommations compteurs Eau chaude + Eau froide (m³)",
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
        title="Consommation Totale des Compteurs Divisionnaires de l'immeuble"
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
          message="Impossible de récupérer les données de consommation de l'immeuble."
          showLink={false}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Consommation Totale des Compteurs Divisionnaires de l&apos;immeuble
        </h3>
        <div className="flex items-center justify-center min-h-[160px] rounded-xl border border-dashed border-gray-200 dark:border-gray-800 mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune donnée de consommation disponible pour cet immeuble.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Consommation Totale des Compteurs Divisionnaires de l&apos;immeuble
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
