"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSecurity } from "@/lib/hooks/useSecurity";

/**
 * Schéma de validation pour le formulaire de mise à jour de mot de passe
 * Règles :
 * - Minimum 8 caractères
 * - Au moins une majuscule
 * - Au moins une minuscule
 * - Au moins un chiffre
 * - Les deux champs doivent correspondre
 */
const updatePasswordSchema = z.object({
  password: z
    .object({
      first: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
      second: z.string().min(1, "La confirmation du mot de passe est requise"),
    })
    .refine((data) => data.first === data.second, {
      message: "Les mots de passe ne correspondent pas",
      path: ["second"],
    }),
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: {
        first: "",
        second: "",
      },
    },
  });

  const { updatePassword, isUpdatingPassword, updatePasswordError } =
    useSecurity();

  // Surveiller les valeurs pour la validation en temps réel
  const passwordFirst = watch("password.first");
  const passwordSecond = watch("password.second");

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      await updatePassword({
        first: data.password.first,
        second: data.password.second,
      });
      setIsSuccess(true);
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // L'erreur est déjà gérée par le hook useSecurity
      // Mais on peut définir une erreur au niveau du formulaire si nécessaire
      setError("root", {
        type: "manual",
        message:
          updatePasswordError ||
          "Une erreur s'est produite. Veuillez réessayer.",
      });
    }
  };

  // Afficher le message d'erreur du hook security ou de la validation du formulaire
  const displayError = updatePasswordError || errors.root?.message;
  const isLoading = isSubmitting || isUpdatingPassword;

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
              Modification du mot de passe
            </h1>
            <p className="text-base text-[#1d1914]">
              Définissez un nouveau mot de passe pour votre compte
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-9 p-4 bg-[#417232] text-[#e9ecef] rounded-lg">
                <p className="font-medium mb-1">Mot de passe modifié</p>
                <p className="text-sm">Votre mot de passe a été modifié avec succès.</p>
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-9 p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
                <p className="font-medium mb-1">Erreur</p>
                <p className="text-sm">{displayError}</p>
              </div>
            )}

            {/* Rappel des règles */}
            {!isSuccess && (
              <div className="mb-6 p-4 bg-[#009bb4] text-[#00344e] rounded-lg">
                <p className="text-sm">
                  <strong>Rappel :</strong> Votre mot de passe doit être composé
                  d&apos;au moins 8 caractères et contenir au moins une majuscule,
                  une minuscule et un chiffre.
                </p>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Nouveau mot de passe */}
                  <div>
                    <Label htmlFor="password.first" className="text-base text-[#1d1914] mb-2 block">
                      Nouveau mot de passe{" "}
                      <span className="text-[#b00511]">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.first"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre nouveau mot de passe"
                        {...register("password.first")}
                        error={!!errors.password?.first}
                        hint={errors.password?.first?.message}
                        className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-[#1d1914]" />
                        ) : (
                          <EyeCloseIcon className="fill-[#1d1914]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Champ Confirmation mot de passe */}
                  <div>
                    <Label htmlFor="password.second" className="text-base text-[#1d1914] mb-2 block">
                      Confirmation du mot de passe{" "}
                      <span className="text-[#b00511]">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.second"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Confirmez votre nouveau mot de passe"
                        {...register("password.second")}
                        error={!!errors.password?.second}
                        hint={errors.password?.second?.message}
                        className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-[#1d1914] hover:text-[#e20613] transition-all duration-300"
                        aria-label={
                          showPasswordConfirm
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPasswordConfirm ? (
                          <EyeIcon className="fill-[#1d1914]" />
                        ) : (
                          <EyeCloseIcon className="fill-[#1d1914]" />
                        )}
                      </button>
                    </div>
                    {/* Afficher une indication si les mots de passe ne correspondent pas */}
                    {passwordFirst &&
                      passwordSecond &&
                      passwordFirst !== passwordSecond && (
                        <p className="mt-1.5 text-xs text-[#b00511]">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>

                  {/* Bouton de soumission */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#e20613] text-white hover:bg-[#b4050f] border border-[#e20613] hover:border-[#b4050f] rounded-lg px-4 py-1.5 min-w-[5.5rem] max-w-[17rem] transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:bg-[#ffa7ac] disabled:pointer-events-none text-base font-normal"
                    >
                      {isLoading ? "Modification en cours..." : "Modifier"}
                    </button>
                    <p className="mt-2 text-xs text-[#1d1914]">
                      <span className="text-[#b00511]">*</span> champs obligatoires
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* Lien vers la connexion */}
            {!isSuccess && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

