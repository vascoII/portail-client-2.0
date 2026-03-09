// components/steps/StepEquipments.tsx
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import NumberInput from "../ui/NumberInput";
import { useSimulation } from "./SimulationContext";

export default function StepEquipments() {
  const { state, update } = useSimulation();

  return (
    <Card title="Équipements">
      <div className="space-y-4">
        <div>
          <Toggle
            label="Lave-vaisselle"
            value={state.dishwasherEnabled}
            onChange={(value) => update({ dishwasherEnabled: value })}
          />
          {state.dishwasherEnabled && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm mb-1">Performance</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={state.dishwasherPerf}
                onChange={(e) =>
                  update({
                    dishwasherPerf:
                      e.target.value === "low" ? "low" : "standard",
                  })
                }
              >
                <option value="low">Faible consommation</option>
                <option value="standard">Standard</option>
              </select>

              <NumberInput
                label="Nombre de cycles par semaine"
                value={state.dishwasherCyclesPerWeek}
                onChange={(value) =>
                  update({ dishwasherCyclesPerWeek: value })
                }
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <Toggle
            label="Lave-linge"
            value={state.washingEnabled}
            onChange={(value) => update({ washingEnabled: value })}
          />
          {state.washingEnabled && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm mb-1">Performance</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={state.washingPerf}
                onChange={(e) =>
                  update({
                    washingPerf: e.target.value === "low" ? "low" : "standard",
                  })
                }
              >
                <option value="low">Faible consommation</option>
                <option value="standard">Standard</option>
              </select>

              <NumberInput
                label="Nombre de cycles par semaine"
                value={state.washingCyclesPerWeek}
                onChange={(value) =>
                  update({ washingCyclesPerWeek: value })
                }
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}