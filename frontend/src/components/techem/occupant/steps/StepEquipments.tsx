// components/steps/StepEquipments.tsx
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import { useState } from "react";

export default function StepEquipments() {
  const [lv, setLv] = useState(false);
  const [ll, setLl] = useState(false);

  return (
    <Card title="Équipements">
      <Toggle label="Lave-vaisselle" value={lv} onChange={setLv} />
      <Toggle label="Lave-linge" value={ll} onChange={setLl} />
    </Card>
  );
}