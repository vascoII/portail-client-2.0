"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Schéma de validation pour le filtre de dates
 */
const dateRangeSchema = z
  .object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si les deux dates sont fournies, vérifier que dateFrom <= dateTo
      if (data.dateFrom && data.dateTo) {
        const from = new Date(data.dateFrom);
        const to = new Date(data.dateTo);
        return from <= to;
      }
      return true;
    },
    {
      message: "La date de début doit être antérieure ou égale à la date de fin",
      path: ["dateTo"],
    }
  );

type DateRangeFormData = z.infer<typeof dateRangeSchema>;

/**
 * Interface pour les props du composant
 */
interface DateRangeFilterProps {
  /**
   * Préfixe unique pour les IDs des champs (pour éviter les conflits si plusieurs filtres sur la même page)
   * Ex: "temp", "eau", "repart", etc.
   */
  prefix?: string;
  /**
   * Date de début initiale (format ISO: YYYY-MM-DD)
   */
  initialDateFrom?: string;
  /**
   * Date de fin initiale (format ISO: YYYY-MM-DD)
   */
  initialDateTo?: string;
  /**
   * Date de début minimale (format ISO: YYYY-MM-DD)
   */
  minDate?: string;
  /**
   * Date de fin maximale (format ISO: YYYY-MM-DD)
   */
  maxDate?: string;
  /**
   * Callback appelé lors du filtrage
   * @param dateFrom - Date de début (format ISO: YYYY-MM-DD ou undefined)
   * @param dateTo - Date de fin (format ISO: YYYY-MM-DD ou undefined)
   */
  onFilter: (dateFrom?: string, dateTo?: string) => void;
  /**
   * Afficher le bouton de filtrage (si false, le filtrage se fait automatiquement)
   */
  showFilterButton?: boolean;
  /**
   * Label personnalisé pour le bouton
   */
  filterButtonLabel?: string;
  /**
   * Classe CSS personnalisée pour le conteneur
   */
  className?: string;
}

/**
 * Composant de filtrage de dates pour les graphiques
 * 
 * Permet de filtrer les données d'un graphique par plage de dates.
 * Le filtrage est effectué côté client (pas d'appel API).
 * 
 * @example
 * ```tsx
 * <DateRangeFilter
 *   prefix="temp"
 *   onFilter={(dateFrom, dateTo) => {
 *     // Filtrer les données du graphique
 *     filterChartData(dateFrom, dateTo);
 *   }}
 * />
 * ```
 */
export default function DateRangeFilter({
  prefix = "filter",
  initialDateFrom,
  initialDateTo,
  minDate,
  maxDate,
  onFilter,
  showFilterButton = true,
  filterButtonLabel = "Filtrer",
  className = "",
}: DateRangeFilterProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DateRangeFormData>({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      dateFrom: initialDateFrom || "",
      dateTo: initialDateTo || "",
    },
  });

  const dateFrom = watch("dateFrom");
  const dateTo = watch("dateTo");

  // Réinitialiser les valeurs si les props initiales changent
  useEffect(() => {
    if (initialDateFrom !== undefined || initialDateTo !== undefined) {
      reset({
        dateFrom: initialDateFrom || "",
        dateTo: initialDateTo || "",
      });
    }
  }, [initialDateFrom, initialDateTo, reset]);

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = (data: DateRangeFormData) => {
    onFilter(data.dateFrom || undefined, data.dateTo || undefined);
  };

  /**
   * Réinitialiser les filtres
   */
  const handleReset = () => {
    reset({
      dateFrom: "",
      dateTo: "",
    });
    onFilter(undefined, undefined);
  };

  // IDs uniques pour les champs
  const dateFromId = `date_from-${prefix}`;
  const dateToId = `date_to-${prefix}`;

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Date de début */}
          <div className="flex-1">
            <Label htmlFor={dateFromId}>Du</Label>
            <Input
              id={dateFromId}
              type="date"
              {...register("dateFrom")}
              min={minDate}
              max={maxDate || dateTo || undefined}
              error={!!errors.dateFrom}
              hint={errors.dateFrom?.message}
            />
          </div>

          {/* Date de fin */}
          <div className="flex-1">
            <Label htmlFor={dateToId}>Au</Label>
            <Input
              id={dateToId}
              type="date"
              {...register("dateTo")}
              min={minDate || dateFrom || undefined}
              max={maxDate}
              error={!!errors.dateTo}
              hint={errors.dateTo?.message}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            {showFilterButton && (
              <Button type="submit" size="sm">
                {filterButtonLabel}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Hook personnalisé pour gérer l'état du filtre de dates
 * 
 * @example
 * ```tsx
 * const { dateFrom, dateTo, setDateFrom, setDateTo, handleFilter } = useDateRangeFilterState({
 *   initialDateFrom: "2024-01-01",
 *   initialDateTo: "2024-12-31",
 * });
 * 
 * return (
 *   <DateRangeFilter
 *     prefix="temp"
 *     initialDateFrom={dateFrom}
 *     initialDateTo={dateTo}
 *     onFilter={handleFilter}
 *   />
 * );
 * ```
 */
export function useDateRangeFilterState(initialValues?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const [dateFrom, setDateFrom] = useState<string | undefined>(
    initialValues?.dateFrom
  );
  const [dateTo, setDateTo] = useState<string | undefined>(
    initialValues?.dateTo
  );

  const handleFilter = (from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  return {
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    handleFilter,
  };
}

