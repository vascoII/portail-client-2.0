"use client";

import { useState } from "react";
import ImmeubleMainCard from "@/components/techem/immeuble/ImmeubleMainCard";
import ImmeubleCard from "@/components/techem/immeuble/ImmeubleCard";
import ImmeubleRelevesCard from "@/components/techem/immeuble/ImmeubleRelevesCard";
import { ImmeubleMetrics } from "@/components/techem/immeuble/ImmeubleMetrics";
import ImmeubleReleves, {
  TabType,
} from "@/components/techem/immeuble/ImmeubleReleves";
import ImmeubleConsommationChart from "@/components/techem/immeuble/ImmeubleConsommationChart";
import ImmeubleStatisticsConsommationChart from "@/components/techem/immeuble/ImmeubleStatisticsConsommationChart";

interface ImmeubleDetailsClientProps {
  pkImmeuble: string;
}

export default function ImmeubleDetailsClient({
  pkImmeuble,
}: ImmeubleDetailsClientProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>("eauFroide");
  const showWaterCharts =
    selectedTab === "eauFroide" || selectedTab === "eauChaude";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <ImmeubleMainCard pkImmeuble={pkImmeuble} />
          <ImmeubleMetrics pkImmeuble={pkImmeuble} />
          <ImmeubleReleves
            pkImmeuble={pkImmeuble}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <ImmeubleCard pkImmeuble={pkImmeuble} />
          <ImmeubleRelevesCard pkImmeuble={pkImmeuble} />
        </div>
      </div>

      {showWaterCharts && (
        <>
          <ImmeubleConsommationChart
            pkImmeuble={pkImmeuble}
            selectedTab={selectedTab}
          />
          <ImmeubleStatisticsConsommationChart
            pkImmeuble={pkImmeuble}
            selectedTab={selectedTab}
          />
        </>
      )}
    </div>
  );
}


