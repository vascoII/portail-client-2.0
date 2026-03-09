// components/ui/DonutChart.tsx
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

// OBLIGATOIRE pour les donuts et pie charts
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ data }: { data: Record<string, number> }) {
  return (
    <Doughnut
      data={{
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: ["#2563eb", "#14b8a6", "#f43f5e", "#f59e0b", "#8b5cf6"]
          }
        ]
      }}
      options={{
        responsive: true,
        cutout: "60%"
      }}
    />
  );
}