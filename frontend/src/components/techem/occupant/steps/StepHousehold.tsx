// components/steps/StepHousehold.tsx
import Card from "../ui/Card";
import NumberInput from "../ui/NumberInput";
import { useSimulation } from "./SimulationContext";

export default function StepHousehold() {
  const { state, update } = useSimulation();

  return (
    <Card title="Profil du logement">
      <NumberInput
        label="Nombre d'occupants"
        value={state.occupants}
        onChange={(value) => update({ occupants: value })}
      />
    </Card>
  );
}