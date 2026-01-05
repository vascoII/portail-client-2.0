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
import { useFront } from "@/lib/hooks/useFront";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/api/client";

/**
 * Schéma de validation pour le formulaire de validation CGU
 * Règles :
 * - Email requis et valide
 * - Confirmation email requise et doit correspondre au premier email
 * - Checkbox CGU doit être cochée
 */
const cguValidationSchema = z
  .object({
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Veuillez entrer une adresse email valide"),
    email_confirm: z
      .string()
      .min(1, "La confirmation de l'email est requise")
      .email("Veuillez entrer une adresse email valide"),
    valid_cgu: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les Conditions Générales d'Utilisation",
    }),
  })
  .refine((data) => data.email === data.email_confirm, {
    message: "Les emails ne correspondent pas",
    path: ["email_confirm"],
  });

type CGUValidationFormData = z.infer<typeof cguValidationSchema>;

interface CGUValidationFormProps {
  /**
   * Type d'utilisateur (gestionnaire ou occupant)
   * Pour afficher le bon contenu CGU
   */
  typeUser?: "gestionnaire" | "occupant";
  /**
   * Contenu CGU à afficher (optionnel)
   */
  cguContent?: React.ReactNode;
}

export default function CGUValidationForm({
  typeUser,
  cguContent,
}: CGUValidationFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<CGUValidationFormData>({
    resolver: zodResolver(cguValidationSchema),
    defaultValues: {
      email: "",
      email_confirm: "",
      valid_cgu: false,
    },
  });

  const { acceptCGU, isAcceptingCGU, acceptCGUError, getCGUStatus } = useFront();

  // Charger l'email actuel si disponible
  useEffect(() => {
    const loadCurrentEmail = async () => {
      try {
        const status = await getCGUStatus();
        // Si l'utilisateur a déjà un email, on peut le pré-remplir
        // (mais normalement en première connexion, il n'y en a pas)
      } catch (error) {
        // Ignorer les erreurs, on continue avec des champs vides
      }
    };
    loadCurrentEmail();
  }, [getCGUStatus]);

  // Surveiller les valeurs des emails pour la validation en temps réel
  const email = watch("email");
  const emailConfirm = watch("email_confirm");
  const validCGU = watch("valid_cgu");

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: CGUValidationFormData) => {
    try {
      await acceptCGU({
        email: data.email,
        email_confirm: data.email_confirm,
        valid_cgu: data.valid_cgu,
      });

      setIsSuccess(true);

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message:
          acceptCGUError ||
          errorMessage ||
          "Une erreur s'est produite lors de la validation des CGU.",
      });
    }
  };

  const isLoading = isSubmitting || isAcceptingCGU;
  const displayError = acceptCGUError || errors.root?.message;

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Première connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vous devez valider les CGU pour pouvoir accéder à l&apos;espace client.
            </p>
          </div>

          {/* Contenu CGU */}
          {cguContent && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {cguContent}
            </div>
          )}

          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="CGU validées"
                  message="Les Conditions Générales d'Utilisation ont été validées avec succès. Redirection en cours..."
                />
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6">
                <Alert variant="error" title="Erreur" message={displayError} />
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
                      placeholder="Email"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                    />
                  </div>

                  {/* Champ Confirmation Email */}
                  <div>
                    <Label htmlFor="email_confirm">
                      Confirmation de l&apos;email{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="email_confirm"
                      type="email"
                      placeholder="Confirmation de l'email"
                      {...register("email_confirm")}
                      error={!!errors.email_confirm}
                      hint={errors.email_confirm?.message}
                    />
                    {/* Afficher une indication si les emails ne correspondent pas */}
                    {email &&
                      emailConfirm &&
                      email !== emailConfirm && (
                        <p className="mt-1.5 text-xs text-error-500">
                          Les emails ne correspondent pas
                        </p>
                      )}
                  </div>

                  {/* Checkbox CGU */}
                  <div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="valid_cgu"
                        checked={validCGU || false}
                        onChange={(checked) => setValue("valid_cgu", checked)}
                      />
                      <Label htmlFor="valid_cgu" className="cursor-pointer">
                        J&apos;accepte les Conditions Générales d&apos;Utilisation{" "}
                        <span className="text-error-500">*</span>
                      </Label>
                    </div>
                    {errors.valid_cgu && (
                      <p className="mt-1.5 text-xs text-error-500">
                        {errors.valid_cgu.message}
                      </p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <Button
                      className="w-full sm:w-auto"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Validation en cours..." : "Continuer"}
                    </Button>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-error-500">*</span> champs obligatoires
                    </p>
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

