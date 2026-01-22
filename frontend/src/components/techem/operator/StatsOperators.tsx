"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import { LoadingChart } from "@/components/ui/loading";
import { api, handleApiError } from "@/lib/api/client";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface GraphPoint {
  date: string;
  value: string | number;
}

interface OperatorsStatsInnerData {
  stats?: {
    GraphPoint?: GraphPoint[];
  };
}

export default function StatsOperators() {
  const [points, setPoints] = useState<GraphPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        console.log("[StatsOperators] Loading statistics...");
        setIsLoading(true);
        setErrorMessage(null);

        const response = await api.get<unknown>(
          "/operators/statistiques"
        );
        console.log("[StatsOperators] Raw API response:", response.data);

        // Response is ApiResponse<...> – we inspect nested data manually to be
        // compatible with both fake and real backends.
        const apiEnvelope = response.data as unknown as {
          data?: unknown;
          [key: string]: unknown;
        };
        const inner = apiEnvelope.data as {
          data?: OperatorsStatsInnerData;
          stats?: { GraphPoint?: GraphPoint[] };
        } | undefined;

        const graphPoints: GraphPoint[] =
          inner?.stats?.GraphPoint ??
          inner?.data?.stats?.GraphPoint ??
          [];

        if (isMounted) {
          console.log("[StatsOperators] GraphPoint stored in state:", graphPoints);
          setPoints(graphPoints);
        }
      } catch (error) {
        console.error("Error loading operators statistics:", error);
        const message =
          handleApiError(error) ||
          "Une erreur s'est produite lors du chargement des statistiques gestionnaires.";
        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const { categories, values } = useMemo(() => {
    const sortedPoints = [...points]
      .map((p) => ({
        ...p,
        dateObj: new Date(p.date),
      }))
      .filter((p) => !Number.isNaN(p.dateObj.getTime()))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const cats: string[] = [];
    const vals: number[] = [];

    sortedPoints.forEach((p) => {
      const label = p.dateObj.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });

      const numericValue =
        typeof p.value === "string" ? Number(p.value) : p.value;
      if (numericValue == null || Number.isNaN(numericValue)) return;

      cats.push(label);
      vals.push(numericValue);
    });

    console.log("[StatsOperators] Computed categories:", cats);
    console.log("[StatsOperators] Computed values:", vals);

    return { categories: cats, values: vals };
  }, [points]);

  const hasData = categories.length > 0 && values.length > 0;

  const options: ApexOptions = useMemo(() => {
    return {
      colors: ["#465fff"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 200,
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
          text: "Nombre de gestionnaires",
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
          formatter: (val: number) =>
            `${val.toLocaleString("fr-FR")} gestionnaire${
              val > 1 ? "s" : ""
            }`,
        },
      },
    };
  }, [categories]);

  const series = useMemo(
    () => [
      {
        name: "Evolution du nombre de gestionnaires",
        data: values,
      },
    ],
    [values]
  );

  if (isLoading) {
    return (
      <LoadingChart
        variant="bar"
        height={220}
        title="Statistiques gestionnaires"
        message="Chargement des statistiques..."
      />
    );
  }

  if (errorMessage) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#b00511] bg-[#b00511] px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
          <p className="font-medium mb-1">Erreur de chargement</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Statistiques gestionnaires
        </h3>
        <div className="mt-4 flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-[#1d1914]">
          <p className="text-base text-[#1d1914]">
            Aucune donnée de statistiques disponible pour les gestionnaires.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d1914] bg-white px-5 pt-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Statistiques gestionnaires
        </h3>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
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


