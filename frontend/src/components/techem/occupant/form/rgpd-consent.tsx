"use client";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyAccount } from "@/lib/hooks/useMyAccount";
import { handleApiError } from "@/lib/api/client";
import { LoadingContainer } from "@/components/ui/loading";
import { useFkUser } from "@/lib/hooks/useFkUser";

/**
 * Schéma de validation pour le formulaire de consentement RGPD
 * Règles :
 * - rgpd_checkbox : checkbox (optionnel, peut être true ou false)
 */
const rgpdConsentSchema = z.object({
  rgpd_checkbox: z.boolean().optional(),
});

type RGPDConsentFormData = z.infer<typeof rgpdConsentSchema>;

export default function RGPDConsentForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const fkUser = useFkUser();

  const {
    register: _register,// eslint-disable-line @typescript-eslint/no-unused-vars
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setValue,
    watch,
  } = useForm<RGPDConsentFormData>({
    resolver: zodResolver(rgpdConsentSchema),
    defaultValues: {
      rgpd_checkbox: false,
    },
  });

  const {
    getMyAccount,
    getMyAccountQuery,
  } = useMyAccount(fkUser);

  const {
    data: accountData,
    isLoading: isAccountLoading,
    error: accountLoadingError,
  } = getMyAccountQuery;

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (accountData?.rgpdcheckboxvalue) {
      const rgpdValue = accountData.rgpdcheckboxvalue === "true";
      reset({
        rgpd_checkbox: rgpdValue,
      });
    }
  }, [accountData, reset]);

  const rgpdCheckbox = watch("rgpd_checkbox");

  /**
   * Gestion de la soumission du formulaire
   * Note: L'API actuelle accepte POST /api/occupant/my-account avec le body contenant rgpd_checkbox
   * Le contrôleur PHP vérifie si le body contient des données pour déterminer la valeur
   */
  const onSubmit = async (data: RGPDConsentFormData) => {
    try {
      // Envoyer une requête POST à l'API avec rgpd_checkbox dans le body
      // L'API vérifie si le body contient des données pour déterminer true/false
      const { api } = await import("@/lib/api/client");
      
      // Si la checkbox est cochée, on envoie un body avec rgpd_checkbox
      // Sinon, on envoie un body vide
      const body = data.rgpd_checkbox ? { rgpd_checkbox: true } : {};
      
      if (!fkUser) {
        throw new Error("fkUser is required to update account");
      }
      
      await api.post(`/occupant/${fkUser}/my-account`, body);
      
      // Recharger les données pour mettre à jour l'état
      await getMyAccount();
      
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
          errorMessage ||
          "Une erreur s'est produite lors de l'enregistrement du consentement.",
      });
    }
  };

  const isLoading = isSubmitting || isAccountLoading;
  const displayError = accountLoadingError || errors.root?.message;

  if (isAccountLoading) {
    return <LoadingContainer message="Chargement des paramètres RGPD..." />;
  }

  if (accountLoadingError) {
    return (
      <div className="flex flex-col flex-1 w-full items-center justify-center">
        <Alert
          variant="error"
          title="Erreur de chargement"
          message={handleApiError(accountLoadingError)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h2 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              RGPD
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestion de votre consentement pour l&apos;accès aux données de consommation
            </p>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg dark:bg-gray-800">
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Consentement enregistré"
                  message="Votre consentement a été enregistré avec succès."
                />
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6">
                <Alert 
                  variant="error" 
                  title="Erreur" 
                  message={typeof displayError === 'string' ? displayError : handleApiError(displayError)} 
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Checkbox RGPD */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="rgpd_checkbox"
                    checked={rgpdCheckbox || false}
                    onChange={(checked) => setValue("rgpd_checkbox", checked)}
                  />
                  <Label htmlFor="rgpd_checkbox" className="cursor-pointer">
                    <strong>
                      J&apos;autorise mon gestionnaire à accéder à mes données de consommation.
                    </strong>
                  </Label>
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

