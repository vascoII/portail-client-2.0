// components/steps/StepHousehold.tsx
import Card from "../ui/Card";
import NumberInput from "../ui/NumberInput";
import { useState } from "react";

export default function StepHousehold() {
  const [occupants, setOccupants] = useState(2);

  return (
    <Card title="Profil du logement">
      <NumberInput
        label="Nombre d'occupants"
        value={occupants}
        onChange={setOccupants}
      />
    </Card>
  );
}