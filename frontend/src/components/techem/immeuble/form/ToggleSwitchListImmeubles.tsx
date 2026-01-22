"use client";
import React, { useState, useEffect } from "react";
import Switch from "@/components/form/switch/Switch";
import MultiSelect from "@/components/form/MultiSelect";

interface FilterFormProps {
  onApply: (filters: {
    fuites: boolean;
    anomalies: boolean;
    dysfonctionnements: boolean;
    depannages: boolean;
    equipment: string[];
  }) => void;
  onCancel?: () => void;
  initialFilters?: {
    fuites: boolean;
    anomalies: boolean;
    dysfonctionnements: boolean;
    depannages: boolean;
    equipment?: string[];
  };
}

export default function ToggleSwitchListImmeubles({
  onApply,
  onCancel,
  initialFilters,
}: FilterFormProps) {
  const [filters, setFilters] = useState({
    fuites: initialFilters?.fuites ?? false,
    anomalies: initialFilters?.anomalies ?? false,
    dysfonctionnements: initialFilters?.dysfonctionnements ?? false,
    depannages: initialFilters?.depannages ?? false,
  });

  // Equipment type options for MultiSelect
  const equipmentOptions = [
    { value: "eau-froide", text: "Eau froide", selected: false },
    { value: "eau-chaude", text: "Eau chaude", selected: false },
    { value: "compteur-energie-thermique", text: "Compteur d'énergie thermique", selected: false },
    { value: "repartiteur", text: "Répartiteur", selected: false },
  ];

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    initialFilters?.equipment ?? []
  );

  // Sync filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        fuites: initialFilters.fuites ?? false,
        anomalies: initialFilters.anomalies ?? false,
        dysfonctionnements: initialFilters.dysfonctionnements ?? false,
        depannages: initialFilters.depannages ?? false,
      });
      if (initialFilters.equipment) {
        setSelectedEquipment(initialFilters.equipment);
      }
    }
  }, [initialFilters]);

  const handleSwitchChange = (filterName: keyof typeof filters) => (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: checked,
    }));
  };

  const handleApply = () => {
    onApply({
      ...filters,
      equipment: selectedEquipment,
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-normal text-[#1d1914]">
        Filtrer les immeubles
      </h4>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <Switch
            label="Fuites"
            defaultChecked={filters.fuites}
            onChange={handleSwitchChange("fuites")}
          />
          <Switch
            label="Anomalies"
            defaultChecked={filters.anomalies}
            onChange={handleSwitchChange("anomalies")}
          />
          <Switch
            label="Alarmes techniques"
            defaultChecked={filters.dysfonctionnements}
            onChange={handleSwitchChange("dysfonctionnements")}
          />
          <Switch
            label="Dépannages en cours"
            defaultChecked={filters.depannages}
            onChange={handleSwitchChange("depannages")}
          />
        </div>

        <div className="relative">
          <MultiSelect
            label="Type d'équipement"
            options={equipmentOptions}
            defaultSelected={selectedEquipment}
            onChange={(values) => setSelectedEquipment(values)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-[#1d1914]">
        {onCancel && (
          <button
            onClick={handleCancel}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-normal text-[#1d1914] bg-white border border-[#1d1914] rounded-lg transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613]"
          >
            Annuler
          </button>
        )}
        <button
          onClick={handleApply}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-normal text-white bg-[#1d1914] rounded-lg transition-all duration-300 hover:bg-[#e20613]"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
