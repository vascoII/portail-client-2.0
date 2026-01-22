"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
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
const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { resetPassword, isResettingPassword, resetPasswordError } = useSecurity();

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // L'erreur est déjà gérée par le hook useSecurity
      // Mais on peut définir une erreur au niveau du formulaire si nécessaire
      setError("root", {
        type: "manual",
        message:
          resetPasswordError ||
          "Une erreur s'est produite. Veuillez réessayer.",
      });
    }
  };

  // Afficher le message d'erreur du hook security ou de la validation du formulaire
  const displayError = resetPasswordError || errors.root?.message;
  const isLoading = isSubmitting || isResettingPassword;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-[49.63rem] sm:pt-10 mx-auto mb-5 px-8">
        <Link
          href="/login"
          className="inline-flex items-center text-base text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
        >
          <ChevronLeftIcon className="text-[#1d1914]" />
          Retour à la connexion
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-[49.63rem] mx-auto px-8">
        <div>
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 text-[#1d1914] text-2xl sm:text-[2.5rem] leading-[2.5rem] sm:leading-[3rem] font-normal">
              Réinitialiser mot de passe
            </h1>
            <p className="text-base text-[#1d1914]">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-9 p-4 bg-[#417232] text-[#e9ecef] rounded-lg">
                <p className="font-medium mb-1">Email envoyé</p>
                <p className="text-sm">Un email contenant un lien de réinitialisation de mot de passe vous sera adressé sur votre boîte email d&apos;ici quelques minutes. Merci de vérifier également votre dossier antispam.</p>
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-9 p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
                <p className="font-medium mb-1">Erreur</p>
                <p className="text-sm">{displayError}</p>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Email */}
                  <div>
                    <Label htmlFor="email" className="text-base text-[#1d1914] mb-2 block">
                      Email <span className="text-[#b00511]">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                      className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                    />
                  </div>

                  {/* Bouton de soumission */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#e20613] text-white hover:bg-[#b4050f] border border-[#e20613] hover:border-[#b4050f] rounded-lg px-4 py-1.5 min-w-[5.5rem] max-w-[17rem] transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:bg-[#ffa7ac] disabled:pointer-events-none text-base font-normal"
                    >
                      {isLoading ? "Envoi en cours..." : "Envoyer"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lien vers la connexion */}
            <div className="mt-5">
              <p className="text-base font-normal text-center text-[#1d1914] sm:text-start">
                Vous vous souvenez de votre mot de passe ? {""}
                <Link
                  href="/login"
                  className="text-[#b00511] hover:text-[#e20613] hover:underline transition-all duration-300"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

