// components/steps/StepHabits.tsx
import Card from "../ui/Card";
import Slider from "../ui/Slider";
import { useState } from "react";

export default function StepHabits() {
  const [douches, setDouches] = useState(7);
  const [bains, setBains] = useState(1);

  return (
    <Card title="Habitudes d'eau">
      <Slider label="Douches par occupant / semaine" value={douches} onChange={setDouches} max={20} />
      <Slider label="Bains par occupant / semaine" value={bains} onChange={setBains} max={7} />
    </Card>
  );
}