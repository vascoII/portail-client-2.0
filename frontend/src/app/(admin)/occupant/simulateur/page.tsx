
"use client";

import React from "react";
// pages/simulateur.tsx
import Wizard from "@/components/techem/occupant/wizard/Wizard";
import StepHousehold from "@/components/techem/occupant/steps/StepHousehold";
import StepEquipments from "@/components/techem/occupant/steps/StepEquipments";
import StepHabits from "@/components/techem/occupant/steps/StepHabits";
import StepGarden from "@/components/techem/occupant/steps/StepGarden";
//import StepResults from "@/components/techem/occupant/steps/StepResults";
import { SimulationResultsCard } from "@/components/techem/occupant/steps/SimulationResultsCard";

export default function SimulateurPage() {
  const usage = {
    douches: 120,
    wc: 30,
    linge: 15,
    vaisselle: 10,
    jardin: 25
  };

  const steps = [
    { component: StepHousehold },
    { component: StepEquipments },
    { component: StepHabits },
    { component: StepGarden },
    { component: () => <SimulationResultsCard data={usage} /> },
  ];

  return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {steps && <Wizard steps={steps} />}
        </div>
  
        <div className="col-span-12 space-y-6 xl:col-span-5">

        </div>
      </div>
    );
}