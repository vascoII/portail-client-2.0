"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
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
    } catch (error) {
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
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Modification du mot de passe
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Définissez un nouveau mot de passe pour votre compte
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Mot de passe modifié"
                  message="Votre mot de passe a été modifié avec succès."
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

            {/* Rappel des règles */}
            {!isSuccess && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
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
                    <Label htmlFor="password.first">
                      Nouveau mot de passe{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.first"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre nouveau mot de passe"
                        {...register("password.first")}
                        error={!!errors.password?.first}
                        hint={errors.password?.first?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Champ Confirmation mot de passe */}
                  <div>
                    <Label htmlFor="password.second">
                      Confirmation du mot de passe{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.second"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Confirmez votre nouveau mot de passe"
                        {...register("password.second")}
                        error={!!errors.password?.second}
                        hint={errors.password?.second?.message}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        aria-label={
                          showPasswordConfirm
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPasswordConfirm ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                    {/* Afficher une indication si les mots de passe ne correspondent pas */}
                    {passwordFirst &&
                      passwordSecond &&
                      passwordFirst !== passwordSecond && (
                        <p className="mt-1.5 text-xs text-error-500">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>

                  {/* Bouton de soumission */}
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Modification en cours..." : "Modifier"}
                    </Button>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-error-500">*</span> champs obligatoires
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* Lien vers la connexion */}
            {!isSuccess && (
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Vous vous souvenez de votre mot de passe ? {""}
                  <Link
                    href="/login"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
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

