"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { FilterImmeublesParams } from "@/lib/hooks/useImmeubles";

/**
 * Options pour le select d'énergie
 */
const energieOptions = [
  { value: "", label: "Toutes les énergies" },
  { value: "energieef", label: "Eau froide" },
  { value: "energieec", label: "Eau chaude" },
  { value: "energiecet", label: "Compteur d'énergie thermique" },
  { value: "energierepart", label: "Répartiteur" },
  { value: "energieelect", label: "Électricité" },
  { value: "energiegaz", label: "Gaz" },
];

/**
 * Interface pour les filtres d'immeubles
 */
export interface ImmeubleFilters {
  EnergieSelect?: string;
  fuites?: boolean;
  anomalies?: boolean;
  dysfonctionnements?: boolean;
  depannages?: boolean;
  chantiers?: boolean;
  reference?: string;
  location?: string;
}

interface FilterImmeublesFormProps {
  /**
   * Filtres initiaux
   */
  initialFilters?: ImmeubleFilters;
  /**
   * Callback appelé quand les filtres changent
   * @param filters - Les nouveaux filtres
   */
  onFiltersChange?: (filters: ImmeubleFilters) => void;
  /**
   * Callback appelé pour déclencher la recherche
   * @param filters - Les filtres à appliquer
   */
  onSearch?: (filters: ImmeubleFilters) => void;
  /**
   * Afficher le bouton de recherche
   */
  showSearchButton?: boolean;
}

/**
 * Convertit les filtres du composant en paramètres API
 */
export function convertImmeubleFiltersToParams(
  filters: ImmeubleFilters,
  additionalParams?: Partial<FilterImmeublesParams>
): FilterImmeublesParams {
  const params: FilterImmeublesParams = { ...additionalParams };

  // Type d'énergie
  if (filters.EnergieSelect) {
    params[filters.EnergieSelect] = "1"; // e.g., energieef: "1"
  }

  // Checkboxes
  if (filters.fuites) params.fuites = true;
  if (filters.anomalies) params.anomalies = true;
  if (filters.dysfonctionnements) params.dysfonctionnements = true;
  if (filters.depannages) params.depannages = true;
  if (filters.chantiers) params.chantiers = true;

  // Champs texte
  if (filters.reference) params.ref = filters.reference;
  if (filters.location) params.adresse = filters.location;

  return params;
}

export default function FilterImmeublesForm({
  initialFilters,
  onFiltersChange,
  onSearch,
  showSearchButton = false,
}: FilterImmeublesFormProps) {
  const [filters, setFilters] = useState<ImmeubleFilters>({
    EnergieSelect: "",
    fuites: false,
    anomalies: false,
    dysfonctionnements: false,
    depannages: false,
    chantiers: false,
    reference: "",
    location: "",
    ...initialFilters,
  });

  // Mettre à jour les filtres si initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  /**
   * Gestion du changement d'un filtre
   */
  const handleFilterChange = useCallback(
    (key: keyof ImmeubleFilters, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        // Appeler le callback si fourni
        if (onFiltersChange) {
          onFiltersChange(newFilters);
        }
        return newFilters;
      });
    },
    [onFiltersChange]
  );

  /**
   * Réinitialiser tous les filtres
   */
  const handleReset = () => {
    const resetFilters: ImmeubleFilters = {
      EnergieSelect: "",
      fuites: false,
      anomalies: false,
      dysfonctionnements: false,
      depannages: false,
      chantiers: false,
      reference: "",
      location: "",
    };
    setFilters(resetFilters);
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
    if (onSearch) {
      onSearch(resetFilters);
    }
  };

  /**
   * Gestion de la recherche
   */
  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-[#1d1914] shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] mb-6">
      <h3 className="text-xl font-normal text-[#1d1914] mb-4">
        Filtré par :
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Select Type d'énergie */}
        <div>
          <label htmlFor="EnergieSelect" className="block text-sm font-normal text-[#1d1914] mb-2">
            Type d&apos;énergie
          </label>
          <select
            id="EnergieSelect"
            value={filters.EnergieSelect || ""}
            onChange={(e) => handleFilterChange("EnergieSelect", e.target.value)}
            className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
          >
            {energieOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes - Colonne 1 */}
        <div className="space-y-3">
          <label className="block text-sm font-normal text-[#1d1914] mb-2">Filtres</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="fuites"
                checked={filters.fuites || false}
                onChange={(e) => handleFilterChange("fuites", e.target.checked)}
                className="w-4 h-4 rounded border-[#1d1914] text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Fuites</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="anomalies"
                checked={filters.anomalies || false}
                onChange={(e) => handleFilterChange("anomalies", e.target.checked)}
                className="w-4 h-4 rounded border-[#1d1914] text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Anomalies</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="dysfonctionnements"
                checked={filters.dysfonctionnements || false}
                onChange={(e) =>
                  handleFilterChange("dysfonctionnements", e.target.checked)
                }
                className="w-4 h-4 rounded border-[#1d1914] text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Alarmes techniques</span>
            </label>
          </div>
        </div>

        {/* Checkboxes - Colonne 2 */}
        <div className="space-y-3">
          <label className="block text-sm font-normal text-[#1d1914] mb-2">Filtres (suite)</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="depannages"
                checked={filters.depannages || false}
                onChange={(e) => handleFilterChange("depannages", e.target.checked)}
                className="w-4 h-4 rounded border-[#1d1914] text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Dépannages en cours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="chantiers"
                checked={filters.chantiers || false}
                onChange={(e) => handleFilterChange("chantiers", e.target.checked)}
                className="w-4 h-4 rounded border-[#1d1914] text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Chantiers en cours</span>
            </label>
          </div>
        </div>

        {/* Inputs texte */}
        <div className="space-y-4">
          <div>
            <label htmlFor="reference" className="block text-sm font-normal text-[#1d1914] mb-2">
              Référence / Numéro
            </label>
            <input
              id="reference"
              type="text"
              placeholder="Référence / Numéro"
              value={filters.reference || ""}
              onChange={(e) => handleFilterChange("reference", e.target.value)}
              className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-normal text-[#1d1914] mb-2">
              Code postal / Ville
            </label>
            <input
              id="location"
              type="text"
              placeholder="Code postal / Ville"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-[#1d1914] bg-white text-[#1d1914] text-sm font-normal transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613]"
        >
          Réinitialiser
        </button>
        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-[#1d1914] text-white text-sm font-normal transition-all duration-300 hover:bg-[#e20613]"
          >
            Rechercher
          </button>
        )}
      </div>
    </div>
  );
}

