// components/steps/StepGarden.tsx
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import { useState } from "react";

export default function StepGarden() {
  const [jardin, setJardin] = useState(false);

  return (
    <Card title="Extérieur">
      <Toggle label="Présence d'un jardin" value={jardin} onChange={setJardin} />
    </Card>
  );
}