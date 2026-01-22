"use client";
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
    useLogementQuery,
    updateOccupant,
    isUpdatingOccupant,
    updateOccupantError,
  } = useLogements();

  // Charger les données du logement
  const {
    data: logementData,
    isLoading: isLoadingLogement,
    error: logementError,
  } = useLogementQuery(pkLogement);

  // Récupérer pkImmeuble à partir des données du logement
  const pkImmeuble =
    logementData?.logement?.Immeuble?.PkImmeuble ??
    logementData?.logement?.Immeuble?.pkImmeuble ??
    logementData?.logement?.immeuble?.PkImmeuble ??
    logementData?.logement?.immeuble?.pkImmeuble ??
    "";

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
      const occupantData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
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

      // Rediriger vers la page du logement après 2 secondes
      setTimeout(() => {
        if (pkImmeuble) {
          router.push(`/immeuble/${pkImmeuble}/logements/${pkLogement}`);
        } else {
          router.push(`/logements/${pkLogement}`);
        }
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
            href={
              pkImmeuble
                ? `/immeuble/${pkImmeuble}/logements/${pkLogement}`
                : `/logements/${pkLogement}`
            }
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour au logement
          </Link>
        </div>
        <div className="flex items-center justify-center flex-1">
          <p className="text-sm text-[#1d1914]">
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
            href={`/logements/${pkLogement}`}
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Retour au logement
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
          <div className="p-4 bg-[#b00511] text-white rounded-lg">
            <p className="font-medium mb-1">Erreur</p>
            <p className="text-sm">Impossible de charger les données du logement. Veuillez réessayer.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href={
            pkImmeuble
              ? `/immeuble/${pkImmeuble}/logements/${pkLogement}`
              : `/logements/${pkLogement}`
          }
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au logement
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-xl font-normal text-[#1d1914] sm:text-2xl">
              Édition de l&apos;occupant
            </h1>
            <p className="text-sm text-[#1d1914]">
              Modifiez les informations de l&apos;occupant
            </p>
          </div>
          <div>
            {/* Message d'alerte si changement en cours */}
            {logementData?.changeinprogress && (
              <div className="mb-6 p-4 bg-[#ffe5e6] border border-[#1d1914] text-[#1d1914] rounded-lg">
                <p className="font-medium mb-1">Changement en cours</p>
                <p className="text-sm">Une demande de changement est actuellement en attente de traitement par les équipes Techem. Vous pouvez néanmoins modifier les données de cette demande.</p>
              </div>
            )}

            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-[#417232] text-white rounded-lg">
                <p className="font-medium mb-1">Occupant modifié</p>
                <p className="text-sm">L&apos;occupant a été modifié avec succès. Redirection en cours...</p>
              </div>
            )}

            {/* Alerte d'erreur */}
            {displayError && !isSuccess && (
              <div className="mb-6 p-4 bg-[#b00511] text-white rounded-lg">
                <p className="font-medium mb-1">Erreur</p>
                <p className="text-sm">{displayError}</p>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Champ Nom de l'occupant */}
                  <div>
                    <label htmlFor="nameOccupant" className="block text-sm font-normal text-[#1d1914] mb-2">
                      Nom de l&apos;occupant{" "}
                      <span className="text-[#b00511]">*</span>
                    </label>
                    <input
                      id="nameOccupant"
                      type="text"
                      placeholder="Saisir le nom de l'occupant"
                      {...register("nameOccupant")}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.nameOccupant ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.nameOccupant && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.nameOccupant.message}</p>
                    )}
                  </div>

                  {/* Champ Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-normal text-[#1d1914] mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Saisir une adresse mail"
                      {...register("email")}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.email ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-normal text-[#1d1914] mb-2">
                      Téléphone <span className="text-[#b00511]">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Saisir un numéro de téléphone (10 chiffres)"
                      {...register("phone")}
                      maxLength={10}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.phone ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.phone.message || "10 chiffres requis"}</p>
                    )}
                  </div>

                  {/* Champ CodeLogeGestio */}
                  <div>
                    <label htmlFor="CodeLogeGestio" className="block text-sm font-normal text-[#1d1914] mb-2">
                      Numéro de logement unique
                    </label>
                    <input
                      id="CodeLogeGestio"
                      type="text"
                      placeholder="Saisir un numéro de logement unique"
                      {...register("CodeLogeGestio")}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.CodeLogeGestio ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.CodeLogeGestio && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.CodeLogeGestio.message}</p>
                    )}
                  </div>

                  {/* Champ numBail */}
                  <div>
                    <label htmlFor="numBail" className="block text-sm font-normal text-[#1d1914] mb-2">Numéro de bail</label>
                    <input
                      id="numBail"
                      type="text"
                      placeholder="Saisir un numéro de Bail"
                      {...register("numBail")}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.numBail ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.numBail && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.numBail.message}</p>
                    )}
                  </div>

                  {/* Champ Date d'arrivée */}
                  <div>
                    <label htmlFor="dateArrivee" className="block text-sm font-normal text-[#1d1914] mb-2">Date d&apos;arrivée</label>
                    <input
                      id="dateArrivee"
                      type="date"
                      {...register("dateArrivee")}
                      className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                        errors.dateArrivee ? "border-[#b00511]" : "border-[#1d1914]"
                      } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                    />
                    {errors.dateArrivee && (
                      <p className="mt-1 text-xs text-[#b00511]">{errors.dateArrivee.message}</p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-4">
                    <button
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-normal text-white transition-all duration-300 ${
                        isLoading
                          ? "bg-[#6a6a6a] cursor-not-allowed"
                          : "bg-[#1d1914] hover:bg-[#e20613]"
                      }`}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Modification en cours..." : "Enregistrer"}
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

