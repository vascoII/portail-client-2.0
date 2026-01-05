"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useState, useMemo } from "react";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useParc } from "@/lib/hooks/useParc";
import { LoadingChart } from "@/components/ui/loading";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function VosReleves() {
  const { parcData, isParcLoading } = useParc();
  
  const pcImmeublesTelereleve = useMemo(() => {
    const board = parcData?.board;
    if (!board) return 0;

    return board.pcImmeublesTelereleve ?? 0;
  }, [parcData]);

  const series = [pcImmeublesTelereleve];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Show loading state while fetching data
  if (isParcLoading) {
    return (
      <LoadingChart 
        height={330} 
        message="Chargement des données..." 
        variant="radial"
        title="Vos Relevés"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Vos Relevés
            </h3>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          des appareils relevés 
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}
