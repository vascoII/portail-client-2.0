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
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
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
    getOperatorQuery,
    updateOperator,
    isUpdating,
    updateError,
  } = useOperators();

  // Charger les données de l'opérateur
  const {
    data: operatorData,
    isLoading: isLoadingOperator,
    error: operatorError,
  } = getOperatorQuery(operatorId);

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
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour à la liste des gestionnaires
          </Link>
        </div>
        <div className="flex items-center justify-center flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour à la liste des gestionnaires
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
          <Alert
            variant="error"
            title="Erreur"
            message="Impossible de charger les données de l'opérateur. Veuillez réessayer."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href="/gestionnaire"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la liste des gestionnaires
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Mise à jour du compte gestionnaire
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remplissez les informations pour modifier le compte gestionnaire
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Compte modifié"
                  message="Le compte a été modifié avec succès. Redirection en cours..."
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
                  {/* Champ Fonction */}
                  <div>
                    <Label htmlFor="job">
                      Fonction <span className="text-error-500">*</span>
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
                    />
                    {errors.job && (
                      <p className="mt-1.5 text-xs text-error-500">
                        {errors.job.message}
                      </p>
                    )}
                  </div>

                  {/* Champs Nom et Prénom */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="lastname">
                        Nom <span className="text-error-500">*</span>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstname">
                        Prénom <span className="text-error-500">*</span>
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
                      />
                    </div>
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <Label htmlFor="phone">
                      Téléphone <span className="text-error-500">*</span>
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
                    />
                  </div>

                  {/* Champs Email */}
                  <div>
                    <Label htmlFor="email.first">
                      Email <span className="text-error-500">*</span>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="email.second">
                      Confirmation Email <span className="text-error-500">*</span>
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
                    />
                    {/* Afficher une indication si les emails ne correspondent pas */}
                    {emailFirst &&
                      emailSecond &&
                      emailFirst !== emailSecond && (
                        <p className="mt-1.5 text-xs text-error-500">
                          Les emails ne correspondent pas
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
                      {isLoading ? "Modification en cours..." : "Modifier le compte"}
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
