
"use client";

import React from "react";
import Wizard from "@/components/techem/occupant/wizard/Wizard";
import StepHousehold from "@/components/techem/occupant/steps/StepHousehold";
import StepEquipments from "@/components/techem/occupant/steps/StepEquipments";
import StepHabits from "@/components/techem/occupant/steps/StepHabits";
import StepGarden from "@/components/techem/occupant/steps/StepGarden";
import { SimulationResultsCard } from "@/components/techem/occupant/steps/SimulationResultsCard";
import { SimulationProvider } from "@/components/techem/occupant/steps/SimulationContext";

export default function SimulateurPage() {
  const steps = [
    { component: StepHousehold },
    { component: StepEquipments },
    { component: StepHabits },
    { component: StepGarden },
    { component: SimulationResultsCard },
  ];

  return (
    <SimulationProvider>
      <Wizard steps={steps} />
    </SimulationProvider>
  );
}