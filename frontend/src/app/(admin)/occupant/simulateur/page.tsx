
"use client";

import React from "react";
import Wizard from "@/components/techem/occupant/wizard/Wizard";
import StepHousehold from "@/components/techem/occupant/steps/StepHousehold";
import StepEquipments from "@/components/techem/occupant/steps/StepEquipments";
import StepHabits from "@/components/techem/occupant/steps/StepHabits";
import StepGarden from "@/components/techem/occupant/steps/StepGarden";
import SimulationResultsCard from "@/components/techem/occupant/simulation/SimulationResultsCard";
import { SimulationProvider } from "@/components/techem/occupant/simulation/SimulationContext";

export default function SimulateurPage() {
  const steps = [
    { component: StepHousehold },
    { component: StepEquipments },
    { component: StepHabits },
    { component: StepGarden },
    { component: SimulationResultsCard },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <SimulationProvider>
          <Wizard steps={steps} />
        </SimulationProvider>
      </div>
      <div className="col-span-12 space-y-6 xl:col-span-5">
      </div>
    </div>   
  );
}