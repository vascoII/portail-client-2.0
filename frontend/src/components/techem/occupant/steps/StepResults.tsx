// components/steps/StepResults.tsx
import Card from "../ui/Card";
import DonutChart from "../ui/DonutChart";

export default function StepResults() {
  const usage = {
    douches: 120,
    wc: 30,
    laveLinge: 15,
    vaisselle: 10,
    jardin: 25,
  };

  return (
    <Card title="Votre consommation estimée">
      <div className="w-64 mx-auto">
        <DonutChart data={usage} />
      </div>

      <p className="text-center mt-4 text-lg font-semibold">
        Total : 200 L / jour
      </p>
    </Card>
  );
}