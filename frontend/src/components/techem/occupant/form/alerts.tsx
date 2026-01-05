"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Checkbox from "@/components/form/input/Checkbox";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleApiError } from "@/lib/api/client";
import Loader from "@/components/ui/loader/Loader";
import { useFkUser } from "@/lib/hooks/useFkUser";
import { useAlertes } from "@/lib/hooks/useAlertes";

/**
 * Schéma de validation pour le formulaire de paramètres d'alerte
 * Règles :
 * - SEUIL_CONSO_ACTIF : checkbox (optionnel)
 * - SEUIL_CONSO_EMAIL : email valide si fourni
 * - SEUIL_CONSO_EF : nombre positif (seuil eau froide en m³)
 * - SEUIL_CONSO_EC : nombre positif (seuil eau chaude en m³)
 */
const alertsSchema = z.object({
  SEUIL_CONSO_ACTIF: z.boolean().optional(),
  SEUIL_CONSO_EMAIL: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .optional()
    .or(z.literal("")),
  SEUIL_CONSO_EF: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Le seuil doit être un nombre positif"
    ),
  SEUIL_CONSO_EC: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Le seuil doit être un nombre positif"
    ),
});

type AlertsFormData = z.infer<typeof alertsSchema>;

export default function AlertsSettingsForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const fkUser = useFkUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setValue,
    watch,
  } = useForm<AlertsFormData>({
    resolver: zodResolver(alertsSchema),
    defaultValues: {
      SEUIL_CONSO_ACTIF: false,
      SEUIL_CONSO_EMAIL: "",
      SEUIL_CONSO_EF: "",
      SEUIL_CONSO_EC: "",
    },
  });

  const {
    getAlertes,
    updateAlertes,
    isUpdatingAlertes,
    updateAlertesError,
    getAlertesQuery,
  } = useAlertes(fkUser);

  const {
    data: alertesData,
    isLoading: isAlertesLoading,
    error: alertesLoadingError,
  } = getAlertesQuery;

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (alertesData?.user) {
      const user = alertesData.user;
      reset({
        SEUIL_CONSO_ACTIF: user.Seuil_Conso_Actif === "O" || user.Seuil_Conso_Actif === true,
        SEUIL_CONSO_EMAIL: user.Seuil_Conso_Email || "",
        SEUIL_CONSO_EF: user.Seuil_Conso_EF ? String(user.Seuil_Conso_EF) : "",
        SEUIL_CONSO_EC: user.Seuil_Conso_EC ? String(user.Seuil_Conso_EC) : "",
      });
    }
  }, [alertesData, reset]);

  const SEUIL_CONSO_ACTIF = watch("SEUIL_CONSO_ACTIF");

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: AlertsFormData) => {
    try {
      // Préparer les données selon le format attendu par l'API
      const alertData: any = {};

      // Convertir le boolean en 'O' ou 'N' (le hook le fait déjà, mais on peut le faire ici aussi)
      if (data.SEUIL_CONSO_ACTIF !== undefined) {
        alertData.SEUIL_CONSO_ACTIF = data.SEUIL_CONSO_ACTIF;
      }

      // Ajouter l'email seulement s'il est fourni
      if (data.SEUIL_CONSO_EMAIL && data.SEUIL_CONSO_EMAIL.trim() !== "") {
        alertData.SEUIL_CONSO_EMAIL = data.SEUIL_CONSO_EMAIL.trim();
      }

      // Ajouter les seuils seulement s'ils sont fournis
      if (data.SEUIL_CONSO_EF && data.SEUIL_CONSO_EF.trim() !== "") {
        alertData.SEUIL_CONSO_EF = data.SEUIL_CONSO_EF.trim();
      }

      if (data.SEUIL_CONSO_EC && data.SEUIL_CONSO_EC.trim() !== "") {
        alertData.SEUIL_CONSO_EC = data.SEUIL_CONSO_EC.trim();
      }

      await updateAlertes(alertData);

      setIsSuccess(true);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message:
          updateAlertesError ||
          errorMessage ||
          "Une erreur s'est produite lors de l'enregistrement des paramètres.",
      });
    }
  };

  const isLoading = isSubmitting || isUpdatingAlertes || isAlertesLoading;
  const displayError = updateAlertesError || alertesLoadingError || errors.root?.message;

  if (!fkUser || isAlertesLoading) {
    return <Loader />;
  }

  if (alertesLoadingError) {
    return (
      <div className="flex flex-col flex-1 w-full items-center justify-center">
        <Alert
          variant="error"
          title="Erreur de chargement"
          message={handleApiError(alertesLoadingError)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-4xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Paramètres de l&apos;alerte
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configurez les alertes de consommation pour votre logement
            </p>
          </div>

          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Paramètres enregistrés"
                  message="Vos paramètres d'alerte ont été enregistrés avec succès."
                />
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6">
                <Alert variant="error" title="Erreur" message={displayError} />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Checkbox Activer l'alerte */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="SEUIL_CONSO_ACTIF"
                    checked={SEUIL_CONSO_ACTIF || false}
                    onChange={(checked) => setValue("SEUIL_CONSO_ACTIF", checked)}
                  />
                  <Label htmlFor="SEUIL_CONSO_ACTIF" className="cursor-pointer">
                    <strong>Activer l&apos;alerte</strong>
                  </Label>
                </div>

                {/* Champ Email */}
                <div>
                  <Label htmlFor="SEUIL_CONSO_EMAIL">E-mail de réception</Label>
                  <Input
                    id="SEUIL_CONSO_EMAIL"
                    type="email"
                    placeholder="E-mail de réception"
                    {...register("SEUIL_CONSO_EMAIL")}
                    error={!!errors.SEUIL_CONSO_EMAIL}
                    hint={errors.SEUIL_CONSO_EMAIL?.message}
                  />
                </div>

                {/* Seuils d'alerte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seuil Eau Froide */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg
                          className="w-6 h-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="SEUIL_CONSO_EF">Seuil d&apos;alerte en m³</Label>
                      <Input
                        id="SEUIL_CONSO_EF"
                        type="text"
                        placeholder="Seuil d'alerte en m³"
                        {...register("SEUIL_CONSO_EF")}
                        error={!!errors.SEUIL_CONSO_EF}
                        hint={errors.SEUIL_CONSO_EF?.message}
                      />
                      <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Eau froide
                      </div>
                    </div>
                  </div>

                  {/* Seuil Eau Chaude */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <svg
                          className="w-6 h-6 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="SEUIL_CONSO_EC">Seuil d&apos;alerte en m³</Label>
                      <Input
                        id="SEUIL_CONSO_EC"
                        type="text"
                        placeholder="Seuil d'alerte en m³"
                        {...register("SEUIL_CONSO_EC")}
                        error={!!errors.SEUIL_CONSO_EC}
                        hint={errors.SEUIL_CONSO_EC?.message}
                      />
                      <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Eau chaude
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="pt-4">
                  <Button
                    className="w-full sm:w-auto"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enregistrement en cours..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

