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

interface LogementConsommationChartEcProps {
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

export default function LogementConsommationChartEc({ pkLogement }: LogementConsommationChartEcProps) {
  const { useLogementQuery } = useLogements();
  const {
    data: logementData,
    isLoading,
    error,
  } = useLogementQuery(pkLogement);

  const { categories, values } = useMemo(() => {
    const logement = logementData?.logement as Record<string, unknown> | undefined;
    const logementEC =
      logement && typeof logement === "object" && "LogementEC" in logement
        ? (logement.LogementEC as Record<string, unknown> | undefined)
        : null;

    const consoPeriode =
      logementEC && typeof logementEC === "object" && "ConsoPeriode" in logementEC
        ? (logementEC.ConsoPeriode as Record<
            "R1" | "R2" | "R3" | "R4" | "R5",
            { DateReleve?: string; Conso?: string | number }
          >)
        : undefined;

    return parseConsoPeriodeReadings(consoPeriode);
  }, [logementData]);

  const hasData =
    categories.length > 0 && values.some((value) => Number.isFinite(value) && value !== 0);

  const options: ApexOptions = useMemo(() => {
    return {
      colors: ["#e20613"], // Techem red for hot water
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
        title="Compteur Eau chaude"
        message="Chargement des consommations..."
      />
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <div className="p-4 bg-[#b00511] text-white rounded-lg">
          <p className="font-medium mb-1">Erreur de chargement</p>
          <p className="text-sm">Impossible de récupérer les données de consommation.</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Compteur Eau chaude
        </h3>
        <div className="flex items-center justify-center min-h-[160px] rounded-xl border border-dashed border-[#1d1914] mt-4">
          <p className="text-base text-[#1d1914]">
            Aucune donnée de consommation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Compteur Eau chaude
        </h3>
        <p className="mt-1 text-sm text-[#1d1914]">
          Information consommation + variation entre deux relevés
        </p>
      </div>

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
