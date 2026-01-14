"use client";
import { useState } from "react";
import { FaFaucet, FaFire, FaChartBar, FaBolt } from "react-icons/fa";

export type TabType = "eauFroide" | "eauChaude" | "repartiteur" | "compteurEnergie";

interface LogementRelevesProps {
  pkLogement: string;
  selectedTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function LogementReleves({ 
  pkLogement,// eslint-disable-line @typescript-eslint/no-unused-vars
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

  const getButtonClass = (tab: TabType) => {
    const baseClasses = "px-3 py-2 font-medium w-full rounded-md text-theme-sm transition-all duration-200 flex items-center justify-center gap-2";
    const isActive = selectedTab === tab;
    
    if (isActive) {
      return `${baseClasses} shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400`;
    }
    
    return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50`;
  };

  // Get icon and color for each tab
  const getTabConfig = (tab: TabType) => {
    switch (tab) {
      case "eauFroide":
        return {
          icon: <FaFaucet className="w-4 h-4" />,
          color: "text-blue-600 dark:text-blue-400",
        };
      case "eauChaude":
        return {
          icon: <FaFire className="w-4 h-4" />,
          color: "text-orange-600 dark:text-orange-400",
        };
      case "repartiteur":
        return {
          icon: <FaChartBar className="w-4 h-4" />,
          color: "text-purple-600 dark:text-purple-400",
        };
      case "compteurEnergie":
        return {
          icon: <FaBolt className="w-4 h-4" />,
          color: "text-green-600 dark:text-green-400",
        };
    }
  };

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
            className={getButtonClass("eauFroide")}
          >
            <span className={selectedTab === "eauFroide" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("eauFroide").icon}
            </span>
            <span>Eau froide</span>
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={getButtonClass("eauChaude")}
          >
            <span className={selectedTab === "eauChaude" ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("eauChaude").icon}
            </span>
            <span>Eau chaude</span>
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={getButtonClass("repartiteur")}
          >
            <span className={selectedTab === "repartiteur" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("repartiteur").icon}
            </span>
            <span>Répartiteur</span>
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={getButtonClass("compteurEnergie")}
          >
            <span className={selectedTab === "compteurEnergie" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
              {getTabConfig("compteurEnergie").icon}
            </span>
            <span>Compteur d&apos;énergie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
