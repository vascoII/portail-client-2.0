"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import React, { useState, useEffect, useCallback } from "react";
import type { FilterLogementsParams, FilterValues } from "@/lib/hooks/useLogements";

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
    (key: keyof LogementFilters, value: any) => {
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
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Filtré par
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

        {/* Checkboxes */}
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
            <Checkbox
              id="depannages"
              label="Dépannages en cours"
              checked={filters.depannages || false}
              onChange={(checked) => handleFilterChange("depannages", checked)}
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

      {/* Filtres dynamiques (batiment, escalier, etage) */}
      {(availableFilters?.batiment ||
        availableFilters?.escalier ||
        availableFilters?.etage) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Filtre Batiment */}
          {availableFilters?.batiment && (
            <div>
              <Label htmlFor="batiment">Batiment</Label>
              <Select
                id="batiment"
                options={[
                  { value: "", label: "Aucun" },
                  ...(availableFilters.batiment as string[]).map((b) => ({
                    value: String(b),
                    label: `Batiment ${b}`,
                  })),
                ]}
                placeholder="Aucun"
                defaultValue={filters.batiment || ""}
                onChange={(value) => handleFilterChange("batiment", value)}
              />
            </div>
          )}

          {/* Filtre Escalier */}
          {availableFilters?.escalier && (
            <div>
              <Label htmlFor="escalier">Escalier</Label>
              <Select
                id="escalier"
                options={[
                  { value: "", label: "Aucun" },
                  ...(availableFilters.escalier as string[]).map((e) => ({
                    value: String(e),
                    label: `Escalier ${e}`,
                  })),
                ]}
                placeholder="Aucun"
                defaultValue={filters.escalier || ""}
                onChange={(value) => handleFilterChange("escalier", value)}
              />
            </div>
          )}

          {/* Filtre Etage */}
          {availableFilters?.etage && (
            <div>
              <Label htmlFor="etage">Etage</Label>
              <Select
                id="etage"
                options={[
                  { value: "", label: "Aucun" },
                  ...(availableFilters.etage as string[]).map((e) => ({
                    value: String(e),
                    label: `Etage ${e}`,
                  })),
                ]}
                placeholder="Aucun"
                defaultValue={filters.etage || ""}
                onChange={(value) => handleFilterChange("etage", value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center gap-3">
        {showSearchButton && (
          <Button size="sm" onClick={handleSearch}>
            Rechercher
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
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

