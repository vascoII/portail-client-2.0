"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { FilterLogementsParams } from "@/lib/hooks/useLogements";
import type { FilterValues } from "@/lib/types/api";

/**
 * Options pour le select d'énergie
 */
const energieOptions = [
  { value: "", label: "Toutes les énergies" },
  { value: "energieef", label: "Eau froide" },
  { value: "energieec", label: "Eau chaude" },
  { value: "energierepart", label: "Répartiteur" },
  { value: "energiecet", label: "Compteur d'énergie thermique" },
  { value: "energieelect", label: "Electricité" },
  { value: "energiegaz", label: "Gaz" },
];

/**
 * Interface pour les filtres de logements
 */
export interface LogementFilters {
  EnergieSelect?: string;
  fuites?: boolean;
  anomalies?: boolean;
  dysfonctionnements?: boolean;
  depannages?: boolean;
  reference?: string;
  location?: string;
  batiment?: string;
  escalier?: string;
  etage?: string;
}

interface FilterLogementsFormProps {
  /**
   * Filtres dynamiques disponibles (batiment, escalier, etage)
   * Chargés depuis l'API
   */
  availableFilters?: FilterValues;
  /**
   * Filtres initiaux
   */
  initialFilters?: LogementFilters;
  /**
   * Callback appelé quand les filtres changent
   * @param filters - Les nouveaux filtres
   */
  onFiltersChange?: (filters: LogementFilters) => void;
  /**
   * Callback appelé pour déclencher la recherche
   * @param filters - Les filtres à appliquer
   */
  onSearch?: (filters: LogementFilters) => void;
  /**
   * Afficher le bouton de recherche
   */
  showSearchButton?: boolean;
  /**
   * Mode gestion parc (masque certains filtres)
   */
  gestion?: boolean;
}

export default function FilterLogementsForm({
  availableFilters,
  initialFilters,
  onFiltersChange,
  onSearch,
  showSearchButton = false,
  gestion = false,
}: FilterLogementsFormProps) {
  const [filters, setFilters] = useState<LogementFilters>({
    EnergieSelect: "",
    fuites: false,
    anomalies: false,
    dysfonctionnements: false,
    depannages: false,
    reference: "",
    location: "",
    batiment: "",
    escalier: "",
    etage: "",
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
    (key: keyof LogementFilters, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const resetFilters: LogementFilters = {
      EnergieSelect: "",
      fuites: false,
      anomalies: false,
      dysfonctionnements: false,
      depannages: false,
      reference: "",
      location: "",
      batiment: "",
      escalier: "",
      etage: "",
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

  // Ne pas afficher les filtres en mode gestion
  if (gestion) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-normal text-[#1d1914]">
          Filtré par
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Select Type d'énergie */}
        <div>
          <label htmlFor="EnergieSelect" className="block text-sm font-normal text-[#1d1914] mb-2">Type d&apos;énergie</label>
          <select
            id="EnergieSelect"
            value={filters.EnergieSelect || ""}
            onChange={(e) => handleFilterChange("EnergieSelect", e.target.value)}
            className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
          >
            {energieOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="block text-sm font-normal text-[#1d1914] mb-2">Filtres</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="fuites"
                checked={filters.fuites || false}
                onChange={(e) => handleFilterChange("fuites", e.target.checked)}
                className="w-4 h-4 border-[#1d1914] rounded text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Fuites</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="anomalies"
                checked={filters.anomalies || false}
                onChange={(e) => handleFilterChange("anomalies", e.target.checked)}
                className="w-4 h-4 border-[#1d1914] rounded text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Anomalies</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="dysfonctionnements"
                checked={filters.dysfonctionnements || false}
                onChange={(e) => handleFilterChange("dysfonctionnements", e.target.checked)}
                className="w-4 h-4 border-[#1d1914] rounded text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Alarmes techniques</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="depannages"
                checked={filters.depannages || false}
                onChange={(e) => handleFilterChange("depannages", e.target.checked)}
                className="w-4 h-4 border-[#1d1914] rounded text-[#1d1914] focus:ring-2 focus:ring-[#1d1914] focus:ring-offset-0"
              />
              <span className="text-sm text-[#1d1914]">Dépannages en cours</span>
            </label>
          </div>
        </div>

        {/* Inputs texte */}
        <div className="space-y-4">
          <div>
            <label htmlFor="reference" className="block text-sm font-normal text-[#1d1914] mb-2">Référence / Numéro</label>
            <input
              id="reference"
              type="text"
              placeholder="Référence / Numéro"
              value={filters.reference || ""}
              onChange={(e) => handleFilterChange("reference", e.target.value)}
              className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-normal text-[#1d1914] mb-2">Code postal / Ville</label>
            <input
              id="location"
              type="text"
              placeholder="Code postal / Ville"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filtres dynamiques (batiment, escalier, etage) */}
      {(availableFilters?.batiment ||
        availableFilters?.escalier ||
        availableFilters?.etage) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Filtre Batiment */}
          {availableFilters?.batiment && (
            <div>
              <label htmlFor="batiment" className="block text-sm font-normal text-[#1d1914] mb-2">Batiment</label>
              <select
                id="batiment"
                value={filters.batiment || ""}
                onChange={(e) => handleFilterChange("batiment", e.target.value)}
                className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
              >
                <option value="">Aucun</option>
                {(availableFilters.batiment as string[]).map((b) => (
                  <option key={String(b)} value={String(b)}>
                    Batiment {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre Escalier */}
          {availableFilters?.escalier && (
            <div>
              <label htmlFor="escalier" className="block text-sm font-normal text-[#1d1914] mb-2">Escalier</label>
              <select
                id="escalier"
                value={filters.escalier || ""}
                onChange={(e) => handleFilterChange("escalier", e.target.value)}
                className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
              >
                <option value="">Aucun</option>
                {(availableFilters.escalier as string[]).map((e) => (
                  <option key={String(e)} value={String(e)}>
                    Escalier {e}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre Etage */}
          {availableFilters?.etage && (
            <div>
              <label htmlFor="etage" className="block text-sm font-normal text-[#1d1914] mb-2">Etage</label>
              <select
                id="etage"
                value={filters.etage || ""}
                onChange={(e) => handleFilterChange("etage", e.target.value)}
                className="w-full px-4 py-2 border border-[#1d1914] rounded-lg text-sm text-[#1d1914] bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
              >
                <option value="">Aucun</option>
                {(availableFilters.etage as string[]).map((e) => (
                  <option key={String(e)} value={String(e)}>
                    Etage {e}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center gap-3">
        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg text-sm font-normal text-white bg-[#1d1914] hover:bg-[#e20613] transition-all duration-300"
          >
            Rechercher
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal text-[#1d1914] bg-white hover:bg-[#ffe5e6] hover:text-[#e20613] transition-all duration-300"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

/**
 * Fonction utilitaire pour convertir LogementFilters en FilterLogementsParams
 */
export function convertFiltersToParams(
  filters: LogementFilters,
  additionalParams?: Partial<FilterLogementsParams>
): FilterLogementsParams {
  const params: FilterLogementsParams = {
    ...additionalParams,
  };

  // Ajouter le filtre d'énergie si sélectionné
  if (filters.EnergieSelect) {
    params[filters.EnergieSelect] = 1;
  }

  // Ajouter les checkboxes
  if (filters.fuites) {
    params.fuites = 1;
  }
  if (filters.anomalies) {
    params.anomalies = 1;
  }
  if (filters.dysfonctionnements) {
    params.dysfonctionnements = 1;
  }
  if (filters.depannages) {
    params.depannages = 1;
  }

  // Ajouter les champs texte
  if (filters.reference) {
    params.ref = filters.reference;
  }
  if (filters.location) {
    params.adresse = filters.location;
  }

  // Ajouter les filtres dynamiques
  if (filters.batiment) {
    params.batiment = filters.batiment;
  }
  if (filters.escalier) {
    params.escalier = filters.escalier;
  }
  if (filters.etage) {
    params.etage = filters.etage;
  }

  return params;
}

