"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Radio from "@/components/form/input/Radio";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Schéma de validation pour le formulaire de simulateur
 */
const simulatorSchema = z
  .object({
    occupants: z.number().min(1, "Le nombre d'occupants doit être au moins 1"),
    dishwasher: z.enum(["yes", "none"]),
    dishwasherPerf: z.enum(["low", "standard"]).optional(),
    dishwasherCycles: z.number().min(0).optional(),
    washingMachine: z.enum(["yes", "none"]),
    washingPerf: z.enum(["low", "standard"]).optional(),
    washingCycles: z.number().min(0).optional(),
    showers: z.number().min(0, "Le nombre de douches doit être positif"),
    baths: z.number().min(0, "Le nombre de bains doit être positif"),
    toilet: z.enum(["standard", "eco"]),
    flushes: z.number().min(0, "Le nombre d'utilisations doit être positif"),
    garden: z.enum(["yes", "none"]),
    gardenSize: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.dishwasher === "yes") {
        return (
          data.dishwasherPerf !== undefined &&
          data.dishwasherCycles !== undefined &&
          data.dishwasherCycles >= 0
        );
      }
      return true;
    },
    {
      message: "Veuillez remplir les champs du lave-vaisselle",
      path: ["dishwasherPerf"],
    }
  )
  .refine(
    (data) => {
      if (data.washingMachine === "yes") {
        return (
          data.washingPerf !== undefined &&
          data.washingCycles !== undefined &&
          data.washingCycles >= 0
        );
      }
      return true;
    },
    {
      message: "Veuillez remplir les champs du lave-linge",
      path: ["washingPerf"],
    }
  )
  .refine(
    (data) => {
      if (data.garden === "yes") {
        return data.gardenSize !== undefined && data.gardenSize >= 0;
      }
      return true;
    },
    {
      message: "Veuillez remplir la surface du jardin",
      path: ["gardenSize"],
    }
  );

type SimulatorFormData = z.infer<typeof simulatorSchema>;

/**
 * Interface pour les résultats de consommation
 */
interface ConsumptionData {
  Douches: number;
  Bains: number;
  "Chasses d'eau": number;
  "Lave-vaisselle": number;
  "Lave-linge": number;
  Jardin: number;
}

/**
 * Fonction de calcul de la consommation
 */
function calculateConsumption(
  data: SimulatorFormData,
  isMonthly: boolean
): ConsumptionData {
  const {
    occupants,
    showers,
    baths,
    flushes,
    toilet,
    dishwasher,
    dishwasherPerf,
    dishwasherCycles,
    washingMachine,
    washingPerf,
    washingCycles,
    garden,
    gardenSize,
  } = data;

  // Calculs en litres par semaine
  const showerUse = occupants * showers * 50;
  const bathUse = occupants * baths * 150;
  const toiletUse = occupants * flushes * (toilet === "eco" ? 5 : 10);
  const dishwasherUse =
    dishwasher === "yes" && dishwasherCycles && dishwasherPerf
      ? dishwasherCycles * (dishwasherPerf === "low" ? 10 : 15)
      : 0;
  const washingUse =
    washingMachine === "yes" && washingCycles && washingPerf
      ? washingCycles * (washingPerf === "low" ? 50 : 70)
      : 0;
  const gardenUse = garden === "yes" && gardenSize ? gardenSize * 6 : 0;

  let consumption: ConsumptionData = {
    Douches: showerUse,
    Bains: bathUse,
    "Chasses d'eau": toiletUse,
    "Lave-vaisselle": dishwasherUse,
    "Lave-linge": washingUse,
    Jardin: gardenUse,
  };

  // Conversion mensuelle si nécessaire
  if (isMonthly) {
    Object.keys(consumption).forEach((key) => {
      consumption[key as keyof ConsumptionData] *= 4;
    });
  }

  return consumption;
}

export default function SimulatorForm() {
  const [isMonthly, setIsMonthly] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<SimulatorFormData>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      occupants: 1,
      dishwasher: "none",
      washingMachine: "none",
      showers: 0,
      baths: 0,
      toilet: "standard",
      flushes: 0,
      garden: "none",
    },
  });

  // Surveiller les valeurs pour les champs conditionnels
  const dishwasher = watch("dishwasher");
  const washingMachine = watch("washingMachine");
  const garden = watch("garden");
  const formData = watch();

  // Calculer automatiquement quand les valeurs changent (après la première soumission)
  const shouldCalculate = showResults && formData.occupants > 0;

  // Calculer la consommation avec useMemo pour optimiser
  const consumption = useMemo(() => {
    if (!shouldCalculate) return null;
    try {
      // Vérifier que les valeurs minimales sont présentes
      if (!formData.occupants || formData.occupants < 1) return null;
      return calculateConsumption(formData, isMonthly);
    } catch {
      return null;
    }
  }, [formData, isMonthly, shouldCalculate]);

  // Calculer le total
  const total = useMemo(() => {
    if (!consumption) return 0;
    return Object.values(consumption).reduce((a, b) => a + b, 0);
  }, [consumption]);

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = (data: SimulatorFormData) => {
    // Valider que tous les champs requis sont remplis
    if (data.occupants > 0) {
      setShowResults(true);
    }
  };

  // Options pour les graphiques ApexCharts
  const chartOptions = useMemo((): ApexOptions | null => {
    if (!consumption) return null;

    return {
      chart: {
        type: "bar" as const,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: Object.keys(consumption),
      },
      yaxis: {
        title: {
          text: "Litres",
        },
      },
      fill: {
        opacity: 1,
      },
      colors: ["#3b82f6"],
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + " litres";
          },
        },
      },
    };
  }, [consumption]);

  const chartSeries = useMemo(() => {
    if (!consumption) return [];

    return [
      {
        name: `Consommation d'eau (${isMonthly ? "mois" : "semaine"})`,
        data: Object.values(consumption),
      },
    ];
  }, [consumption, isMonthly]);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-4xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Simulateur de consommation
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Calculez votre consommation d&apos;eau estimée en fonction de vos habitudes
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre d'occupants */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <Label htmlFor="occupants">
                Nombre d&apos;occupants <span className="text-error-500">*</span>
              </Label>
              <Input
                id="occupants"
                type="number"
                min="1"
                {...register("occupants", { valueAsNumber: true })}
                error={!!errors.occupants}
                hint={errors.occupants?.message}
              />
            </div>

            {/* Lave-vaisselle */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Lave-vaisselle
                </h3>
                <div className="flex gap-4">
                  <Controller
                    name="dishwasher"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Radio
                          id="dishwasherNo"
                          name="dishwasher"
                          value="none"
                          checked={field.value === "none"}
                          label="Non"
                          onChange={field.onChange}
                        />
                        <Radio
                          id="dishwasherYes"
                          name="dishwasher"
                          value="yes"
                          checked={field.value === "yes"}
                          label="Oui"
                          onChange={field.onChange}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              {dishwasher === "yes" && (
                <div className="space-y-4 mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <Label htmlFor="dishwasherPerf">Performance</Label>
                    <Controller
                      name="dishwasherPerf"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={[
                            { value: "low", label: "Faible consommation" },
                            { value: "standard", label: "Standard" },
                          ]}
                          placeholder="Sélectionner une performance"
                          onChange={field.onChange}
                          defaultValue={field.value}
                        />
                      )}
                    />
                    {errors.dishwasherPerf && (
                      <p className="mt-1.5 text-xs text-error-500">
                        {errors.dishwasherPerf.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dishwasherCycles">
                      Nombre de cycles par semaine
                    </Label>
                    <Input
                      id="dishwasherCycles"
                      type="number"
                      min="0"
                      {...register("dishwasherCycles", { valueAsNumber: true })}
                      error={!!errors.dishwasherCycles}
                      hint={errors.dishwasherCycles?.message}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lave-linge */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Lave-linge
                </h3>
                <div className="flex gap-4">
                  <Controller
                    name="washingMachine"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Radio
                          id="washingMachineNo"
                          name="washingMachine"
                          value="none"
                          checked={field.value === "none"}
                          label="Non"
                          onChange={field.onChange}
                        />
                        <Radio
                          id="washingMachineYes"
                          name="washingMachine"
                          value="yes"
                          checked={field.value === "yes"}
                          label="Oui"
                          onChange={field.onChange}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              {washingMachine === "yes" && (
                <div className="space-y-4 mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <Label htmlFor="washingPerf">Performance</Label>
                    <Controller
                      name="washingPerf"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={[
                            { value: "low", label: "Faible consommation" },
                            { value: "standard", label: "Standard" },
                          ]}
                          placeholder="Sélectionner une performance"
                          onChange={field.onChange}
                          defaultValue={field.value}
                        />
                      )}
                    />
                    {errors.washingPerf && (
                      <p className="mt-1.5 text-xs text-error-500">
                        {errors.washingPerf.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="washingCycles">
                      Nombre de cycles par semaine
                    </Label>
                    <Input
                      id="washingCycles"
                      type="number"
                      min="0"
                      {...register("washingCycles", { valueAsNumber: true })}
                      error={!!errors.washingCycles}
                      hint={errors.washingCycles?.message}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Douches et bains */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="showers">
                    Nombre de douches hebdomadaires par occupant{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="showers"
                    type="number"
                    min="0"
                    {...register("showers", { valueAsNumber: true })}
                    error={!!errors.showers}
                    hint={errors.showers?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="baths">
                    Nombre de bains hebdomadaires par occupant{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="baths"
                    type="number"
                    min="0"
                    {...register("baths", { valueAsNumber: true })}
                    error={!!errors.baths}
                    hint={errors.baths?.message}
                  />
                </div>
              </div>
            </div>

            {/* WC */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  WC
                </h3>
                <div className="flex gap-4">
                  <Controller
                    name="toilet"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Radio
                          id="toiletStandard"
                          name="toilet"
                          value="standard"
                          checked={field.value === "standard"}
                          label="Standard"
                          onChange={field.onChange}
                        />
                        <Radio
                          id="toiletEco"
                          name="toilet"
                          value="eco"
                          checked={field.value === "eco"}
                          label="Économique"
                          onChange={field.onChange}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="flushes">
                  Utilisation par occupant et par semaine
                </Label>
                <Input
                  id="flushes"
                  type="number"
                  min="0"
                  {...register("flushes", { valueAsNumber: true })}
                  error={!!errors.flushes}
                  hint={errors.flushes?.message}
                />
              </div>
            </div>

            {/* Jardin */}
            <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Jardin
                </h3>
                <div className="flex gap-4">
                  <Controller
                    name="garden"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Radio
                          id="gardenNo"
                          name="garden"
                          value="none"
                          checked={field.value === "none"}
                          label="Non"
                          onChange={field.onChange}
                        />
                        <Radio
                          id="gardenYes"
                          name="garden"
                          value="yes"
                          checked={field.value === "yes"}
                          label="Oui"
                          onChange={field.onChange}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              {garden === "yes" && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <Label htmlFor="gardenSize">Surface du jardin (m²)</Label>
                  <Input
                    id="gardenSize"
                    type="number"
                    min="0"
                    {...register("gardenSize", { valueAsNumber: true })}
                    error={!!errors.gardenSize}
                    hint={errors.gardenSize?.message}
                  />
                </div>
              )}
            </div>

            {/* Bouton de calcul */}
            <div className="flex justify-center">
              <Button type="submit" size="sm">
                Calculer
              </Button>
            </div>
          </form>

          {/* Résultats et graphique */}
          {showResults && consumption && (
            <div className="mt-8 bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
              <div className="flex items-center gap-4 mb-6">
                <Checkbox
                  id="periodToggle"
                  checked={isMonthly}
                  onChange={setIsMonthly}
                />
                <Label htmlFor="periodToggle" className="cursor-pointer">
                  Afficher les résultats en valeurs mensuelles
                </Label>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-6">
                Consommation {isMonthly ? "mensuelle" : "hebdomadaire"}:{" "}
                {total.toLocaleString("fr-FR")} litres
              </h2>

              {chartOptions && chartSeries.length > 0 && (
                <div className="mt-6">
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                    height={350}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

