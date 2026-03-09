// components/steps/StepGarden.tsx
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import NumberInput from "../ui/NumberInput";
import { useSimulation } from "./SimulationContext";

export default function StepGarden() {
  const { state, update } = useSimulation();

  return (
    <Card title="Extérieur">
      <Toggle
        label="Présence d'un jardin"
        value={state.gardenEnabled}
        onChange={(value) => update({ gardenEnabled: value })}
      />

      {state.gardenEnabled && (
        <div className="mt-3">
          <NumberInput
            label="Surface du jardin (m²)"
            value={state.gardenSizeM2}
            onChange={(value) => update({ gardenSizeM2: value })}
          />
        </div>
      )}
    </Card>
  );
}