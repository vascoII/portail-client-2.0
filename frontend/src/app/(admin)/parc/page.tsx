import type { Metadata } from "next";
import React from "react";
import VosReleves from "@/components/techem/parc/VosReleves";
import VosChantiers from "@/components/techem/parc/VosChantiers";
import { ParcMetrics } from "@/components/techem/parc/ParcMetrics";
import ParcMainCard from "@/components/techem/parc/ParcMainCard";
import FicheClient from "@/components/techem/parc/FicheClient";

export const metadata: Metadata = {
  title: "Parc | TECHEM - Espace client",
  description: "Parc management",
};

export default function ParcPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <ParcMainCard />
        <ParcMetrics />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-5">
        <FicheClient />
        <VosReleves />
        <VosChantiers />
      </div>

      <div className="col-span-12">
        
      </div>

      <div className="col-span-12 xl:col-span-5">
        
      </div>

      <div className="col-span-12 xl:col-span-7">
        
      </div>
    </div>
  );
}

