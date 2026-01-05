"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  SearchImmeublesParams,
  SearchOccupantsParams,
} from "@/lib/hooks/useSearch";

/**
 * Options pour le type de recherche
 */
const searchTypeOptions = [
  { value: "immeuble", label: "Immeubles" },
  { value: "occupant", label: "Logements" },
];

/**
 * Schéma de validation pour le formulaire de recherche
 * Règles :
 * - ref, ref_numero : minimum 1 caractère
 * - nom, tout, adresse : minimum 3 caractères
 */
const searchSchema = z.object({
  type: z.enum(["immeuble", "occupant"]),
  ref: z.string().optional(),
  ref_numero: z.string().optional(),
  nom: z.string().optional(),
  tout: z.string().optional(),
  adresse: z.string().optional(),
  pkImmeuble: z.string().optional(), // Pour les occupants uniquement
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  /**
   * Valeurs initiales du formulaire
   */
  initialValues?: Partial<SearchFormData>;
  /**
   * Callback appelé lors de la soumission du formulaire
   * @param type - Type de recherche ('immeuble' ou 'occupant')
   * @param params - Paramètres de recherche
   */
  onSearch: (
    type: "immeuble" | "occupant",
    params: SearchImmeublesParams | SearchOccupantsParams
  ) => void;
  /**
   * Afficher le champ pkImmeuble (pour les occupants)
   */
  showPkImmeuble?: boolean;
  /**
   * État de chargement
   */
  isLoading?: boolean;
}

/**
 * Valide et nettoie les paramètres de recherche selon les règles de l'API
 * - ref, ref_numero : minimum 1 caractère
 * - nom, tout, adresse : minimum 3 caractères
 */
function cleanSearchParams(
  data: SearchFormData
): SearchImmeublesParams | SearchOccupantsParams {
  const params: any = {};

  // Champs avec minimum 1 caractère
  if (data.ref && data.ref.trim().length >= 1) {
    params.ref = data.ref.trim();
  }
  if (data.ref_numero && data.ref_numero.trim().length >= 1) {
    params.ref_numero = data.ref_numero.trim();
  }

  // Champs avec minimum 3 caractères
  if (data.nom && data.nom.trim().length >= 3) {
    params.nom = data.nom.trim();
  }
  if (data.tout && data.tout.trim().length >= 3) {
    params.tout = data.tout.trim();
  }
  if (data.adresse && data.adresse.trim().length >= 3) {
    params.adresse = data.adresse.trim();
  }

  // Champ spécifique aux occupants
  if (data.type === "occupant" && data.pkImmeuble) {
    params.pkImmeuble = data.pkImmeuble;
  }

  return params;
}

export default function SearchForm({
  initialValues,
  onSearch,
  showPkImmeuble = false,
  isLoading = false,
}: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      type: "immeuble",
      ref: "",
      ref_numero: "",
      nom: "",
      tout: "",
      adresse: "",
      pkImmeuble: "",
      ...initialValues,
    },
  });

  const searchType = watch("type");

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = (data: SearchFormData) => {
    const cleanedParams = cleanSearchParams(data);
    
    // Vérifier qu'au moins un critère de recherche est fourni
    if (Object.keys(cleanedParams).length === 0) {
      // Afficher une erreur ou ne rien faire
      return;
    }

    onSearch(data.type, cleanedParams);
  };

  /**
   * Réinitialiser le formulaire
   */
  const handleReset = () => {
    setValue("ref", "");
    setValue("ref_numero", "");
    setValue("nom", "");
    setValue("tout", "");
    setValue("adresse", "");
    if (showPkImmeuble) {
      setValue("pkImmeuble", "");
    }
  };

  return (
    <div className="w-full bg-white p-4 shadow-md rounded-lg dark:bg-gray-800 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Recherche
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type de recherche */}
        <div>
          <Label htmlFor="type">
            Type de recherche <span className="text-error-500">*</span>
          </Label>
          <Select
            id="type"
            options={searchTypeOptions}
            defaultValue={searchType || "immeuble"}
            onChange={(value) => setValue("type", value as "immeuble" | "occupant")}
          />
        </div>

        {/* Champ pkImmeuble (pour les occupants uniquement) */}
        {showPkImmeuble && searchType === "occupant" && (
          <div>
            <Label htmlFor="pkImmeuble">ID Immeuble (optionnel)</Label>
            <Input
              id="pkImmeuble"
              type="text"
              placeholder="ID de l'immeuble"
              {...register("pkImmeuble")}
              error={!!errors.pkImmeuble}
              hint={errors.pkImmeuble?.message}
            />
          </div>
        )}

        {/* Champs de recherche - Minimum 1 caractère */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ref">Référence</Label>
            <Input
              id="ref"
              type="text"
              placeholder="Référence (min. 1 caractère)"
              {...register("ref")}
              error={!!errors.ref}
              hint={errors.ref?.message}
            />
          </div>
          <div>
            <Label htmlFor="ref_numero">Numéro de référence</Label>
            <Input
              id="ref_numero"
              type="text"
              placeholder="Numéro de référence (min. 1 caractère)"
              {...register("ref_numero")}
              error={!!errors.ref_numero}
              hint={errors.ref_numero?.message}
            />
          </div>
        </div>

        {/* Champs de recherche - Minimum 3 caractères */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              type="text"
              placeholder="Nom (min. 3 caractères)"
              {...register("nom")}
              error={!!errors.nom}
              hint={errors.nom?.message}
            />
          </div>
          <div>
            <Label htmlFor="tout">Recherche globale</Label>
            <Input
              id="tout"
              type="text"
              placeholder="Recherche globale (min. 3 caractères)"
              {...register("tout")}
              error={!!errors.tout}
              hint={errors.tout?.message}
            />
          </div>
          <div>
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              type="text"
              placeholder="Adresse (min. 3 caractères)"
              {...register("adresse")}
              error={!!errors.adresse}
              hint={errors.adresse?.message}
            />
          </div>
        </div>

        {/* Message d'aide */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note :</strong> Les champs "Référence" et "Numéro de référence" nécessitent au moins 1 caractère.
            Les champs "Nom", "Recherche globale" et "Adresse" nécessitent au moins 3 caractères.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            size="sm"
            disabled={isLoading}
          >
            Réinitialiser
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? "Recherche en cours..." : "Rechercher"}
          </Button>
        </div>
      </form>
    </div>
  );
}

