"use client";

import { useState } from "react";
import { LoadingChart } from "@/components/ui/loading";
import { useParc } from "@/lib/hooks/useParc";

export default function VosChantiers() {
  const { isParcLoading } = useParc();
  const [isOpen, setIsOpen] = useState(false);

  if (isParcLoading) {
    return (
      <LoadingChart
        height={200}
        message="Chargement des chantiers..."
        variant="radial"
        title="Vos Chantiers"
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#1d1914] shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <div className="px-5 pt-5 pb-6 bg-white rounded-xl sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-normal text-[#1d1914]">
            Vos Chantiers
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-3 py-2 text-sm font-normal text-[#1d1914] hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613] transition-all duration-300"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L10 7L15 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 8L10 13L15 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            Voir le statut
          </button>
        </div>

        <div
          className={`transition-all ${
            isOpen ? "mt-5 max-h-40 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#1d1914] bg-[#ffe5e6] px-4 py-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e20613] text-white">
              🚧
            </span>
            <div>
              <p className="text-sm font-medium text-[#1d1914]">
                Fonctionnalité à venir
              </p>
              <p className="text-sm text-[#1d1914]">
                La section chantiers est en cours de conception. Vous serez 
                informés par notification lorsque la fonctionnalité sera disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
