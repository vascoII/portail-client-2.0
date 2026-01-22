"use client";
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
  typeUser, // eslint-disable-line @typescript-eslint/no-unused-vars
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
        const status = await getCGUStatus(); // eslint-disable-line @typescript-eslint/no-unused-vars
        // Si l'utilisateur a déjà un email, on peut le pré-remplir
        // (mais normalement en première connexion, il n'y en a pas)
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
        <div className="rounded-xl border border-[#1d1914] bg-white p-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-xl font-normal text-[#1d1914]">
              Première connexion
            </h1>
            <p className="text-sm text-[#1d1914]">
              Vous devez valider les CGU pour pouvoir accéder à l&apos;espace client.
            </p>
          </div>

          {/* Contenu CGU */}
          {cguContent && (
            <div className="mb-6 p-4 bg-[#e9ecef] rounded-xl border border-[#1d1914] max-h-96 overflow-y-auto">
              {cguContent}
            </div>
          )}

          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <div className="p-4 bg-[#417232] text-white rounded-lg">
                  <p className="font-medium mb-1">CGU validées</p>
                  <p className="text-sm">Les Conditions Générales d&apos;Utilisation ont été validées avec succès. Redirection en cours...</p>
                </div>
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6">
                <div className="p-4 bg-[#b00511] text-white rounded-lg">
                  <p className="font-medium mb-1">Erreur</p>
                  <p className="text-sm">{displayError}</p>
                </div>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Email */}
                  <div>
                    <label htmlFor="email" className="block text-base text-[#1d1914] mb-2">
                      Email <span className="text-[#b00511]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...register("email")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300 ${
                        errors.email ? "border-[#b00511]" : "border-[#1d1914]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-[#b00511]">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Champ Confirmation Email */}
                  <div>
                    <label htmlFor="email_confirm" className="block text-base text-[#1d1914] mb-2">
                      Confirmation de l&apos;email{" "}
                      <span className="text-[#b00511]">*</span>
                    </label>
                    <input
                      id="email_confirm"
                      type="email"
                      placeholder="Confirmation de l'email"
                      {...register("email_confirm")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300 ${
                        errors.email_confirm ? "border-[#b00511]" : "border-[#1d1914]"
                      }`}
                    />
                    {errors.email_confirm && (
                      <p className="mt-1 text-sm text-[#b00511]">{errors.email_confirm.message}</p>
                    )}
                    {/* Afficher une indication si les emails ne correspondent pas */}
                    {email &&
                      emailConfirm &&
                      email !== emailConfirm && (
                        <p className="mt-1 text-sm text-[#b00511]">
                          Les emails ne correspondent pas
                        </p>
                      )}
                  </div>

                  {/* Checkbox CGU */}
                  <div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="valid_cgu"
                        checked={validCGU || false}
                        onChange={(e) => setValue("valid_cgu", e.target.checked)}
                        className="w-4 h-4 mt-1 text-[#e20613] border-[#1d1914] rounded focus:ring-2 focus:ring-[#c2dafe] focus:ring-offset-0"
                      />
                      <label htmlFor="valid_cgu" className="cursor-pointer text-base text-[#1d1914]">
                        J&apos;accepte les Conditions Générales d&apos;Utilisation{" "}
                        <span className="text-[#b00511]">*</span>
                      </label>
                    </div>
                    {errors.valid_cgu && (
                      <p className="mt-1 text-sm text-[#b00511]">
                        {errors.valid_cgu.message}
                      </p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-lg font-normal text-base transition-all duration-300 w-full sm:w-auto ${
                        isLoading
                          ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                          : "bg-[#e20613] text-white hover:bg-[#b00511] cursor-pointer"
                      }`}
                    >
                      {isLoading ? "Validation en cours..." : "Continuer"}
                    </button>
                    <p className="mt-2 text-xs text-[#1d1914]">
                      <span className="text-[#b00511]">*</span> champs obligatoires
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

