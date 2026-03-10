"use client";

import React, { createContext, useContext, useState } from "react";

export type ToiletType = "standard" | "eco";
export type AppliancePerf = "low" | "standard";

export interface SimulationState {
  occupants: number;

  // Habitudes
  showersPerOccupantPerWeek: number;
  bathsPerOccupantPerWeek: number;

  // WC
  toiletType: ToiletType;
  flushesPerOccupantPerWeek: number;

  // Lave-vaisselle
  dishwasherEnabled: boolean;
  dishwasherPerf: AppliancePerf;
  dishwasherCyclesPerWeek: number;

  // Lave-linge
  washingEnabled: boolean;
  washingPerf: AppliancePerf;
  washingCyclesPerWeek: number;

  // Jardin
  gardenEnabled: boolean;
  gardenSizeM2: number;

  // Affichage des résultats
  isMonthly: boolean;
}

interface SimulationContextValue {
  state: SimulationState;
  update: (partial: Partial<SimulationState>) => void;
}

const defaultState: SimulationState = {
  occupants: 2,
  showersPerOccupantPerWeek: 7,
  bathsPerOccupantPerWeek: 0,
  toiletType: "standard",
  flushesPerOccupantPerWeek: 25,
  dishwasherEnabled: false,
  dishwasherPerf: "standard",
  dishwasherCyclesPerWeek: 0,
  washingEnabled: false,
  washingPerf: "standard",
  washingCyclesPerWeek: 0,
  gardenEnabled: false,
  gardenSizeM2: 0,
  isMonthly: false,
};

const SimulationContext = createContext<SimulationContextValue | undefined>(
  undefined,
);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>(defaultState);

  const update = (partial: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SimulationContext.Provider value={{ state, update }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return ctx;
}

