"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
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
    (key: keyof ImmeubleFilters, value: any) => {
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
    <div className="w-full bg-white p-4 shadow-md rounded-lg dark:bg-gray-800 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Filtré par :
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Select Type d'énergie */}
        <div>
          <Label htmlFor="EnergieSelect">Type d&apos;énergie</Label>
          <Select
            id="EnergieSelect"
            options={energieOptions}
            placeholder="Toutes les énergies"
            defaultValue={filters.EnergieSelect || ""}
            onChange={(value) => handleFilterChange("EnergieSelect", value)}
          />
        </div>

        {/* Checkboxes - Colonne 1 */}
        <div className="space-y-3">
          <Label>Filtres</Label>
          <div className="space-y-2">
            <Checkbox
              id="fuites"
              label="Fuites"
              checked={filters.fuites || false}
              onChange={(checked) => handleFilterChange("fuites", checked)}
            />
            <Checkbox
              id="anomalies"
              label="Anomalies"
              checked={filters.anomalies || false}
              onChange={(checked) => handleFilterChange("anomalies", checked)}
            />
            <Checkbox
              id="dysfonctionnements"
              label="Alarmes techniques"
              checked={filters.dysfonctionnements || false}
              onChange={(checked) =>
                handleFilterChange("dysfonctionnements", checked)
              }
            />
          </div>
        </div>

        {/* Checkboxes - Colonne 2 */}
        <div className="space-y-3">
          <Label>Filtres (suite)</Label>
          <div className="space-y-2">
            <Checkbox
              id="depannages"
              label="Dépannages en cours"
              checked={filters.depannages || false}
              onChange={(checked) => handleFilterChange("depannages", checked)}
            />
            <Checkbox
              id="chantiers"
              label="Chantiers en cours"
              checked={filters.chantiers || false}
              onChange={(checked) => handleFilterChange("chantiers", checked)}
            />
          </div>
        </div>

        {/* Inputs texte */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="reference">Référence / Numéro</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Référence / Numéro"
              defaultValue={filters.reference || ""}
              onChange={(e) => handleFilterChange("reference", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Code postal / Ville</Label>
            <Input
              id="location"
              type="text"
              placeholder="Code postal / Ville"
              defaultValue={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          size="sm"
        >
          Réinitialiser
        </Button>
        {showSearchButton && (
          <Button type="button" onClick={handleSearch} size="sm">
            Rechercher
          </Button>
        )}
      </div>
    </div>
  );
}

