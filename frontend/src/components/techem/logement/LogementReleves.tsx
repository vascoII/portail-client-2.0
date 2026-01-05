"use client";
import { useState } from "react";

export type TabType = "eauFroide" | "eauChaude" | "repartiteur" | "compteurEnergie";

interface LogementRelevesProps {
  pkLogement: string;
  selectedTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function LogementReleves({ 
  pkLogement,
  selectedTab: controlledTab,
  onTabChange,
}: LogementRelevesProps) {
  const [uncontrolledTab, setUncontrolledTab] = useState<TabType>("eauFroide");

  const selectedTab = controlledTab ?? uncontrolledTab;

  const handleTabChange = (tab: TabType) => {
    if (controlledTab === undefined) {
      setUncontrolledTab(tab);
    }
    onTabChange?.(tab);
  };

  const getButtonClass = (tab: TabType) =>
    selectedTab === tab
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Relevés
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
          <button
            onClick={() => handleTabChange("eauFroide")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "eauFroide"
            )}`}
          >
            Eau froide
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "eauChaude"
            )}`}
          >
            Eau chaude
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "repartiteur"
            )}`}
          >
            Répartiteur
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              "compteurEnergie"
            )}`}
          >
            Compteur d&apos;énergie
          </button>
        </div>
      </div>
    </div>
  );
}
