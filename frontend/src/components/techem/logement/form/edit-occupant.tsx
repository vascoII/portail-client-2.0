"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogements } from "@/lib/hooks/useLogements";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/api/client";

/**
 * Schéma de validation pour le formulaire d'édition d'occupant
 * Règles :
 * - Nom de l'occupant requis
 * - Email optionnel mais doit être valide si fourni
 * - Téléphone requis, 10 chiffres exactement
 * - CodeLogeGestio optionnel
 * - numBail optionnel
 * - dateArrivee optionnel (date)
 */
const editOccupantSchema = z.object({
  nameOccupant: z.string().min(1, "Le nom de l'occupant est requis"),
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(/^[0-9]{10}$/, "Le téléphone doit contenir exactement 10 chiffres"),
  CodeLogeGestio: z.string().optional(),
  numBail: z.string().optional(),
  dateArrivee: z.string().optional(),
});

type EditOccupantFormData = z.infer<typeof editOccupantSchema>;

interface EditOccupantFormProps {
  pkLogement: string | number;
}

export default function EditOccupantForm({ pkLogement }: EditOccupantFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<EditOccupantFormData>({
    resolver: zodResolver(editOccupantSchema),
    defaultValues: {
      nameOccupant: "",
      email: "",
      phone: "",
      CodeLogeGestio: "",
      numBail: "",
      dateArrivee: "",
    },
  });

  const {
    getLogementQuery,
    updateOccupant,
    isUpdatingOccupant,
    updateOccupantError,
  } = useLogements();

  // Charger les données du logement
  const {
    data: logementData,
    isLoading: isLoadingLogement,
    error: logementError,
  } = getLogementQuery(pkLogement);

  // Pré-remplir le formulaire avec les données de l'occupant
  useEffect(() => {
    if (logementData?.logement && logementData?.occupant) {
      const occupant = logementData.occupant;
      const currentOccupant = logementData.logement.Occupant;

      // Utiliser les nouvelles données si disponibles, sinon les données actuelles
      reset({
        nameOccupant: occupant.newNom || currentOccupant?.Nom || "",
        email: occupant.newEmail || currentOccupant?.Email || "",
        phone: occupant.newTelmobile || currentOccupant?.TelMobile || currentOccupant?.TelFixe || "",
        CodeLogeGestio: occupant.CodeLogeGestio || "",
        numBail: occupant.numBail || "",
        dateArrivee: occupant.dateArrivee || (currentOccupant?.DateArrivee 
          ? new Date(currentOccupant.DateArrivee).toISOString().split("T")[0]
          : ""),
      });
    } else if (logementData?.logement?.Occupant) {
      // Si pas de données occupant dans la réponse, utiliser les données actuelles
      const currentOccupant = logementData.logement.Occupant;
      reset({
        nameOccupant: currentOccupant.Nom || "",
        email: currentOccupant.Email || "",
        phone: currentOccupant.TelMobile || currentOccupant.TelFixe || "",
        CodeLogeGestio: "",
        numBail: "",
        dateArrivee: currentOccupant.DateArrivee
          ? new Date(currentOccupant.DateArrivee).toISOString().split("T")[0]
          : "",
      });
    }
  }, [logementData, reset]);

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: EditOccupantFormData) => {
    try {
      // Préparer les données selon le format attendu par l'API
      const occupantData: any = {
        newNom: data.nameOccupant,
        newTelmobile: data.phone,
      };

      // Ajouter l'email seulement s'il est fourni
      if (data.email && data.email.trim() !== "") {
        occupantData.newEmail = data.email;
      }

      // Ajouter les champs optionnels s'ils sont fournis
      if (data.CodeLogeGestio && data.CodeLogeGestio.trim() !== "") {
        occupantData.CodeLogeGestio = data.CodeLogeGestio;
      }

      if (data.numBail && data.numBail.trim() !== "") {
        occupantData.numBail = data.numBail;
      }

      if (data.dateArrivee && data.dateArrivee.trim() !== "") {
        occupantData.dateArrivee = data.dateArrivee;
      }

      await updateOccupant(pkLogement, occupantData);

      setIsSuccess(true);

      // Rediriger vers la page de gestion du parc après 2 secondes
      setTimeout(() => {
        router.push(`/gestionParc/${pkLogement}`);
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message:
          updateOccupantError ||
          errorMessage ||
          "Une erreur s'est produite lors de la modification de l'occupant.",
      });
    }
  };

  const isLoading = isSubmitting || isUpdatingOccupant;
  const displayError = updateOccupantError || errors.root?.message;

  // Afficher un loader pendant le chargement des données
  if (isLoadingLogement) {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="w-full max-w-2xl mx-auto mb-5">
          <Link
            href={`/gestionParc/${pkLogement}`}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour au logement
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
  if (logementError) {
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="w-full max-w-2xl mx-auto mb-5">
          <Link
            href={`/gestionParc/${pkLogement}`}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour au logement
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
          <Alert
            variant="error"
            title="Erreur"
            message="Impossible de charger les données du logement. Veuillez réessayer."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href={`/gestionParc/${pkLogement}`}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au logement
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Édition de l&apos;occupant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Modifiez les informations de l&apos;occupant
            </p>
          </div>
          <div>
            {/* Message d'alerte si changement en cours */}
            {logementData?.changeinprogress && (
              <div className="mb-6">
                <Alert
                  variant="warning"
                  title="Changement en cours"
                  message="Une demande de changement est actuellement en attente de traitement par les équipes Techem. Vous pouvez néanmoins modifier les données de cette demande."
                />
              </div>
            )}

            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Occupant modifié"
                  message="L'occupant a été modifié avec succès. Redirection en cours..."
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
                  {/* Champ Nom de l'occupant */}
                  <div>
                    <Label htmlFor="nameOccupant">
                      Nom de l&apos;occupant{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="nameOccupant"
                      type="text"
                      placeholder="Saisir le nom de l'occupant"
                      {...register("nameOccupant")}
                      error={!!errors.nameOccupant}
                      hint={errors.nameOccupant?.message}
                    />
                  </div>

                  {/* Champ Email */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Saisir une adresse mail"
                      {...register("email")}
                      error={!!errors.email}
                      hint={errors.email?.message}
                    />
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <Label htmlFor="phone">
                      Téléphone <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Saisir un numéro de téléphone (10 chiffres)"
                      {...register("phone")}
                      error={!!errors.phone}
                      hint={errors.phone?.message || "10 chiffres requis"}
                      maxLength={10}
                    />
                  </div>

                  {/* Champ CodeLogeGestio */}
                  <div>
                    <Label htmlFor="CodeLogeGestio">
                      Numéro de logement unique
                    </Label>
                    <Input
                      id="CodeLogeGestio"
                      type="text"
                      placeholder="Saisir un numéro de logement unique"
                      {...register("CodeLogeGestio")}
                      error={!!errors.CodeLogeGestio}
                      hint={errors.CodeLogeGestio?.message}
                    />
                  </div>

                  {/* Champ numBail */}
                  <div>
                    <Label htmlFor="numBail">Numéro de bail</Label>
                    <Input
                      id="numBail"
                      type="text"
                      placeholder="Saisir un numéro de Bail"
                      {...register("numBail")}
                      error={!!errors.numBail}
                      hint={errors.numBail?.message}
                    />
                  </div>

                  {/* Champ Date d'arrivée */}
                  <div>
                    <Label htmlFor="dateArrivee">Date d&apos;arrivée</Label>
                    <Input
                      id="dateArrivee"
                      type="date"
                      {...register("dateArrivee")}
                      error={!!errors.dateArrivee}
                      hint={errors.dateArrivee?.message}
                    />
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <Button
                      className="w-full sm:w-auto"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Modification en cours..." : "Enregistrer"}
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

