// components/steps/StepHabits.tsx
import Card from "../ui/Card";
import Slider from "../ui/Slider";
import NumberInput from "../ui/NumberInput";
import { useSimulation } from "./SimulationContext";

export default function StepHabits() {
  const { state, update } = useSimulation();

  return (
    <Card title="Habitudes d'eau">
      <Slider
        label="Douches hebdomadaires par occupant"
        value={state.showersPerOccupantPerWeek}
        onChange={(value) =>
          update({ showersPerOccupantPerWeek: value })
        }
        max={20}
      />
      <Slider
        label="Bains hebdomadaires par occupant"
        value={state.bathsPerOccupantPerWeek}
        onChange={(value) => update({ bathsPerOccupantPerWeek: value })}
        max={7}
      />

      <div className="mt-4 space-y-2">
        <span className="block text-sm mb-1">WC</span>
        <div className="flex items-center gap-4 mb-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="toiletType"
              value="standard"
              checked={state.toiletType === "standard"}
              onChange={() => update({ toiletType: "standard" })}
            />
            <span>Standard</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="toiletType"
              value="eco"
              checked={state.toiletType === "eco"}
              onChange={() => update({ toiletType: "eco" })}
            />
            <span>Économique</span>
          </label>
        </div>

        <NumberInput
          label="Utilisation par occupant et par semaine"
          value={state.flushesPerOccupantPerWeek}
          onChange={(value) => update({ flushesPerOccupantPerWeek: value })}
        />
      </div>
    </Card>
  );
}