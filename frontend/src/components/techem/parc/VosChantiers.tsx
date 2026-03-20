"use client";

import { useState } from "react";
import { LoadingChart } from "@/components/ui/loading";
import { useParc } from "@/lib/hooks/useParc";

import { ChantierDashboardCard } from "@/components/techem/parc/ChantierCard";

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
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-6 bg-white shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Vos Chantiers
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:text-white"
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
            isOpen ? "mt-5 max-h-240 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <ChantierDashboardCard/>
        </div>
      </div>
    </div>
  );
}
