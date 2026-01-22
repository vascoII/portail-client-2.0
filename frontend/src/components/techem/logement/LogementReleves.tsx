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
    const baseClasses = "px-3 py-2 font-normal w-full rounded-md text-sm transition-all duration-300 flex items-center justify-center gap-2";
    const isActive = selectedTab === tab;
    
    if (isActive) {
      return `${baseClasses} shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] text-[#1d1914] bg-white border-2 border-[#1d1914]`;
    }
    
    return `${baseClasses} text-[#1d1914] hover:text-[#e20613] hover:bg-[#ffe5e6]`;
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
    <div className="rounded-xl border border-[#1d1914] bg-[#e9ecef] shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <div className="px-5 pt-5 bg-white rounded-xl pb-11 sm:px-6 sm:pt-6">
        <div className="mb-6">
          <h3 className="text-xl font-normal text-[#1d1914]">
            Relevés
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg bg-[#e9ecef] p-0.5">
          <button
            onClick={() => handleTabChange("eauFroide")}
            className={getButtonClass("eauFroide")}
          >
            <span className={selectedTab === "eauFroide" ? "text-[#009bb4]" : "text-[#1d1914]"}>
              {getTabConfig("eauFroide").icon}
            </span>
            <span>Eau froide</span>
          </button>
          <button
            onClick={() => handleTabChange("eauChaude")}
            className={getButtonClass("eauChaude")}
          >
            <span className={selectedTab === "eauChaude" ? "text-[#e20613]" : "text-[#1d1914]"}>
              {getTabConfig("eauChaude").icon}
            </span>
            <span>Eau chaude</span>
          </button>
          <button
            onClick={() => handleTabChange("repartiteur")}
            className={getButtonClass("repartiteur")}
          >
            <span className={selectedTab === "repartiteur" ? "text-[#6a6a6a]" : "text-[#1d1914]"}>
              {getTabConfig("repartiteur").icon}
            </span>
            <span>Répartiteur</span>
          </button>
          <button
            onClick={() => handleTabChange("compteurEnergie")}
            className={getButtonClass("compteurEnergie")}
          >
            <span className={selectedTab === "compteurEnergie" ? "text-[#417232]" : "text-[#1d1914]"}>
              {getTabConfig("compteurEnergie").icon}
            </span>
            <span>Compteur d&apos;énergie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
