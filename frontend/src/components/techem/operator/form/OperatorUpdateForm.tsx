"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOperators } from "@/lib/hooks/useOperators";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/api/client";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";

/**
 * Schéma de validation pour le formulaire de modification d'opérateur
 * Règles :
 * - Fonction (job) requise
 * - Nom (lastname) requis
 * - Prénom (firstname) requis
 * - Téléphone (phone) requis
 * - Email requis et valide
 * - Confirmation email requise et doit correspondre au premier email
 */
const updateOperatorSchema = z
  .object({
    job: z.string().min(1, "La fonction est requise"),
    lastname: z.string().min(1, "Le nom est requis"),
    firstname: z.string().min(1, "Le prénom est requis"),
    phone: z.string().min(1, "Le téléphone est requis"),
    email: z
      .object({
        first: z
          .string()
          .min(1, "L'email est requis")
          .email("Veuillez entrer une adresse email valide"),
        second: z
          .string()
          .min(1, "La confirmation de l'email est requise")
          .email("Veuillez entrer une adresse email valide"),
      })
      .refine((data) => data.first === data.second, {
        message: "Les emails ne correspondent pas",
        path: ["second"],
      }),
  });

type UpdateOperatorFormData = z.infer<typeof updateOperatorSchema>;

interface OperatorUpdateFormProps {
  operatorId: string | number;
}

export default function OperatorUpdateForm({ operatorId }: OperatorUpdateFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    reset,
  } = useForm<UpdateOperatorFormData>({
    resolver: zodResolver(updateOperatorSchema),
    defaultValues: {
      job: "",
      lastname: "",
      firstname: "",
      phone: "",
      email: {
        first: "",
        second: "",
      },
    },
  });

  const {
    useOperatorQuery,
    updateOperator,
    isUpdating,
    updateError,
  } = useOperators();

  // Charger les données de l'opérateur
  const {
    data: operatorData,
    isLoading: isLoadingOperator,
    error: operatorError,
  } = useOperatorQuery(operatorId);

  // Pré-remplir le formulaire avec les données de l'opérateur
  useEffect(() => {
    if (operatorData?.user) {
      const user = operatorData.user;
      reset({
        job: user.UserRole || "",
        lastname: user.UserName || "",
        firstname: user.FirstName || "",
        phone: user.PhoneNumber || "",
        email: {
          first: user.EMail || user.LoginID || "",
          second: user.EMail || user.LoginID || "",
        },
      });
    }
  }, [operatorData, reset]);

  // Surveiller les valeurs des emails pour la validation en temps réel
  const emailFirst = watch("email.first");
  const emailSecond = watch("email.second");

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: UpdateOperatorFormData) => {
    try {
      await updateOperator(operatorId, {
        job: data.job,
        lastname: data.lastname,
        firstname: data.firstname,
        phone: data.phone,
        email: {
          first: data.email.first,
          second: data.email.second,
        },
      });

      setIsSuccess(true);

      // Rediriger vers la liste des gestionnaires après 2 secondes
      setTimeout(() => {
        router.push("/gestionnaire");
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message:
          updateError ||
          errorMessage ||
          "Une erreur s'est produite lors de la modification du compte.",
      });
    }
  };

  const isLoading = isSubmitting || isUpdating;
  const displayError = updateError || errors.root?.message;

  // Afficher un loader pendant le chargement des données
  if (isLoadingOperator) {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href="/gestionnaire"
          className="inline-flex items-center text-sm text-[#1d1914] transition-colors hover:text-[#e20613]"
        >
          <ChevronLeftIcon />
          Retour à la liste des gestionnaires
        </Link>
      </div>
        <div className="flex items-center justify-center flex-1">
          <p className="text-base text-[#1d1914]">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (operatorError) {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="w-full max-w-2xl mx-auto mb-5">
          <Link
            href="/gestionnaire"
            className="inline-flex items-center text-sm text-[#1d1914] transition-colors hover:text-[#e20613]"
          >
            <ChevronLeftIcon />
            Retour à la liste des gestionnaires
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
          <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
            <p className="font-medium mb-1">Erreur</p>
            <p className="text-sm">Impossible de charger les données de l&apos;opérateur. Veuillez réessayer.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href="/gestionnaire"
          className="inline-flex items-center text-sm text-[#1d1914] transition-colors hover:text-[#e20613]"
        >
          <ChevronLeftIcon />
          Retour à la liste des gestionnaires
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-normal text-[#1d1914] text-title-sm sm:text-title-md">
              Mise à jour du compte gestionnaire
            </h1>
            <p className="text-base text-[#1d1914]">
              Remplissez les informations pour modifier le compte gestionnaire
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-9">
                <div className="p-4 bg-[#417232] text-[#e9ecef] rounded-lg">
                  <p className="font-medium mb-1">Compte modifié</p>
                  <p className="text-sm">Le compte a été modifié avec succès. Redirection en cours...</p>
                </div>
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-9">
                <div className="p-4 bg-[#b00511] text-[#e9ecef] rounded-lg">
                  <p className="font-medium mb-1">Erreur</p>
                  <p className="text-sm">{displayError}</p>
                </div>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Fonction */}
                  <div>
                    <Label htmlFor="job" className="text-base text-[#1d1914] mb-2 block">
                      Fonction <span className="text-[#b00511]">*</span>
                    </Label>
                    <Input
                      id="job"
                      type="text"
                      placeholder="Fonction"
                      {...(() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { ref, onChange, onBlur, min, max, ...rest } = register("job");
                        return { onChange, onBlur, ref, ...rest };
                      })()}
                      error={!!errors.job}
                      hint={errors.job?.message}
                      className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                    />
                    {errors.job && (
                      <p className="mt-1.5 text-xs text-[#b00511]">
                        {errors.job.message}
                      </p>
                    )}
                  </div>

                  {/* Champs Nom et Prénom */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="lastname" className="text-base text-[#1d1914] mb-2 block">
                        Nom <span className="text-[#b00511]">*</span>
                      </Label>
                      <Input
                        id="lastname"
                        type="text"
                        placeholder="Nom"
                        {...(() => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { ref, onChange, onBlur, min, max, ...rest } = register("lastname");
                          return { onChange, onBlur, ref, ...rest };
                        })()}
                        error={!!errors.lastname}
                        hint={errors.lastname?.message}
                        className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstname" className="text-base text-[#1d1914] mb-2 block">
                        Prénom <span className="text-[#b00511]">*</span>
                      </Label>
                      <Input
                        id="firstname"
                        type="text"
                        placeholder="Prénom"
                        {...(() => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { ref, onChange, onBlur, min, max, ...rest } = register("firstname");
                          return { onChange, onBlur, ref, ...rest };
                        })()}
                        error={!!errors.firstname}
                        hint={errors.firstname?.message}
                        className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <Label htmlFor="phone" className="text-base text-[#1d1914] mb-2 block">
                      Téléphone <span className="text-[#b00511]">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Téléphone"
                      {...(() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { ref, onChange, onBlur, min, max, ...rest } = register("phone");
                        return { onChange, onBlur, ref, ...rest };
                      })()}
                      error={!!errors.phone}
                      hint={errors.phone?.message}
                      className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                    />
                  </div>

                  {/* Champs Email */}
                  <div>
                    <Label htmlFor="email.first" className="text-base text-[#1d1914] mb-2 block">
                      Email <span className="text-[#b00511]">*</span>
                    </Label>
                    <Input
                      id="email.first"
                      type="email"
                      placeholder="Email"
                      {...(() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { ref, onChange, onBlur, min, max, ...rest } = register("email.first");
                        return { onChange, onBlur, ref, ...rest };
                      })()}
                      error={!!errors.email?.first}
                      hint={errors.email?.first?.message}
                      className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email.second" className="text-base text-[#1d1914] mb-2 block">
                      Confirmation Email <span className="text-[#b00511]">*</span>
                    </Label>
                    <Input
                      id="email.second"
                      type="email"
                      placeholder="Confirmation Email"
                      {...(() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { ref, onChange, onBlur, min, max, ...rest } = register("email.second");
                        return { onChange, onBlur, ref, ...rest };
                      })()}
                      error={!!errors.email?.second}
                      hint={errors.email?.second?.message}
                      className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe] focus:border-[#1d1914] text-[#1d1914] placeholder:text-[#6a6a6a] transition-all duration-300"
                    />
                    {/* Afficher une indication si les emails ne correspondent pas */}
                    {emailFirst &&
                      emailSecond &&
                      emailFirst !== emailSecond && (
                        <p className="mt-1.5 text-xs text-[#b00511]">
                          Les emails ne correspondent pas
                        </p>
                      )}
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <button
                      className="w-full sm:w-auto bg-[#e20613] text-white hover:bg-[#b4050f] border border-[#e20613] hover:border-[#b4050f] rounded-lg px-4 py-1.5 min-w-[5.5rem] max-w-[17rem] transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe] disabled:bg-[#ffa7ac] disabled:pointer-events-none text-sm font-normal"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Modification en cours..." : "Modifier le compte"}
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
