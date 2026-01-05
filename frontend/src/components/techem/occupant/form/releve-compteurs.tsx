"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSecurity } from "@/lib/hooks/useSecurity";

/**
 * Schéma de validation pour le formulaire de réinitialisation de mot de passe
 */
const releveCompteursSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),
});

type releveCompteursFormData = z.infer<typeof releveCompteursSchema>;

export default function releveCompteursForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<releveCompteursFormData>({
    resolver: zodResolver(releveCompteursSchema),
    defaultValues: {
      email: "",
    },
  });

  const { releveCompteurs, isResettingPassword, releveCompteursError } = useSecurity();

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: releveCompteursFormData) => {
    try {
      await releveCompteurs(data.email);
      setIsSuccess(true);
    } catch (error) {
      // L'erreur est déjà gérée par le hook useSecurity
      // Mais on peut définir une erreur au niveau du formulaire si nécessaire
      setError("root", {
        type: "manual",
        message:
          releveCompteursError ||
          "Une erreur s'est produite. Veuillez réessayer.",
      });
    }
  };

  // Afficher le message d'erreur du hook security ou de la validation du formulaire
  const displayError = releveCompteursError || errors.root?.message;
  const isLoading = isSubmitting || isResettingPassword;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Transmettre votre relevé de compteurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Le releveur s&apos;est présenté à votre résidence mais n&apos;a pas pu accéder à votre logement pour le relevé de vos compteurs d’eau. Vous avez la possibilité de relever et nous transmettre via le formulaire ci-dessous votre consommation d&apos;eau.
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Email envoyé"
                  message="Un email contenant un lien de réinitialisation de mot de passe vous sera adressé sur votre boîte email d'ici quelques minutes. Merci de vérifier également votre dossier antispam."
                />
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="error"
                  title="Erreur"
                  message={displayError}
                />
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Email */}
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                    />
                  </div>

                  {/* Bouton de soumission */}
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Envoi en cours..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

