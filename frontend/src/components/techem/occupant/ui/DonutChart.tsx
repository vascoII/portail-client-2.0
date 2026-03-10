// components/ui/DonutChart.tsx
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ data }: { data: Record<string, number> }) {
  const colors = [
    "#008DFF",
    "#6EC8FF",
    "#00C2A0",
    "#FFC65C",
    "#FF7A7A",
    "#8b5cf6"
  ];

  return (
    <Doughnut
      data={{
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: colors,
            borderWidth: 1,
          }
        ]
      }}
      options={{
        responsive: true,
        cutout: "60%",
        plugins: {
          legend: {
            position: "right",
          }
        }
      }}
    />
  );
}