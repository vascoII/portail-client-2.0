"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOccupant, type ReleveOccupantRequest } from "@/lib/hooks/useOccupant";

/**
 * Schéma de validation pour le formulaire de relevé de compteurs
 */
const releveCompteursSchema = z.object({
  // Informations Immeuble
  numeroImmeuble: z.string().min(1, "Le numéro d'immeuble est requis"),
  batiment: z.string().optional(),
  escalier: z.string().optional(),
  etage: z.string().optional(),
  datePassage: z.string().min(1, "La date de passage est requise"),

  // Informations Occupant
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  adresse: z.string().min(1, "L'adresse est requise"),
  codePostal: z.string().min(1, "Le code postal est requis"),
  ville: z.string().min(1, "La ville est requise"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),

  // Compteurs Eau Froide
  cuisine_ef_num: z.string().optional(),
  cuisine_ef: z.number().min(0).optional(),
  salleDeBains_ef_num: z.string().optional(),
  salleDeBains_ef: z.number().min(0).optional(),
  wc_ef_num: z.string().optional(),
  wc_ef: z.number().min(0).optional(),
  autreEmplacement_ef_loc: z.string().optional(),
  autreEmplacement_ef_num: z.string().optional(),
  autreEmplacement_ef: z.number().min(0).optional(),

  // Compteurs Eau Chaude
  cuisine_ec_num: z.string().optional(),
  cuisine_ec: z.number().min(0).optional(),
  salleDeBains_ec_num: z.string().optional(),
  salleDeBains_ec: z.number().min(0).optional(),
  wc_ec_num: z.string().optional(),
  wc_ec: z.number().min(0).optional(),
  autreEmplacement_ec_loc: z.string().optional(),
  autreEmplacement_ec_num: z.string().optional(),
  autreEmplacement_ec: z.number().min(0).optional(),
});

type ReleveCompteursFormData = z.infer<typeof releveCompteursSchema>;

export default function ReleveCompteursForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ReleveCompteursFormData>({
    resolver: zodResolver(releveCompteursSchema),
    defaultValues: {
      numeroImmeuble: "",
      batiment: "",
      escalier: "",
      etage: "",
      datePassage: "",
      prenom: "",
      nom: "",
      adresse: "",
      codePostal: "",
      ville: "",
      telephone: "",
      email: "",
      cuisine_ef_num: "",
      cuisine_ef: 0,
      salleDeBains_ef_num: "",
      salleDeBains_ef: 0,
      wc_ef_num: "",
      wc_ef: 0,
      autreEmplacement_ef_loc: "",
      autreEmplacement_ef_num: "",
      autreEmplacement_ef: 0,
      cuisine_ec_num: "",
      cuisine_ec: 0,
      salleDeBains_ec_num: "",
      salleDeBains_ec: 0,
      wc_ec_num: "",
      wc_ec: 0,
      autreEmplacement_ec_loc: "",
      autreEmplacement_ec_num: "",
      autreEmplacement_ec: 0,
    },
  });

  const { setReleveOccupant, isSubmittingReleve, releveError } = useOccupant();

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: ReleveCompteursFormData) => {
    try {
      // Préparer les données selon le format attendu par l'API
      const releveData: ReleveOccupantRequest = {
        // Informations Immeuble
        numeroImmeuble: data.numeroImmeuble,
        batiment: data.batiment || undefined,
        escalier: data.escalier || undefined,
        etage: data.etage || undefined,
        datePassage: data.datePassage,

        // Informations Occupant
        prenom: data.prenom,
        nom: data.nom,
        adresse: data.adresse,
        codePostal: data.codePostal,
        ville: data.ville,
        telephone: data.telephone,
        email: data.email,

        // Compteurs Eau Froide
        cuisine_ef_num: data.cuisine_ef_num || undefined,
        cuisine_ef: data.cuisine_ef && data.cuisine_ef > 0 ? data.cuisine_ef : undefined,
        salleDeBains_ef_num: data.salleDeBains_ef_num || undefined,
        salleDeBains_ef: data.salleDeBains_ef && data.salleDeBains_ef > 0 ? data.salleDeBains_ef : undefined,
        wc_ef_num: data.wc_ef_num || undefined,
        wc_ef: data.wc_ef && data.wc_ef > 0 ? data.wc_ef : undefined,
        autreEmplacement_ef_loc: data.autreEmplacement_ef_loc || undefined,
        autreEmplacement_ef_num: data.autreEmplacement_ef_num || undefined,
        autreEmplacement_ef: data.autreEmplacement_ef && data.autreEmplacement_ef > 0 ? data.autreEmplacement_ef : undefined,

        // Compteurs Eau Chaude
        cuisine_ec_num: data.cuisine_ec_num || undefined,
        cuisine_ec: data.cuisine_ec && data.cuisine_ec > 0 ? data.cuisine_ec : undefined,
        salleDeBains_ec_num: data.salleDeBains_ec_num || undefined,
        salleDeBains_ec: data.salleDeBains_ec && data.salleDeBains_ec > 0 ? data.salleDeBains_ec : undefined,
        wc_ec_num: data.wc_ec_num || undefined,
        wc_ec: data.wc_ec && data.wc_ec > 0 ? data.wc_ec : undefined,
        autreEmplacement_ec_loc: data.autreEmplacement_ec_loc || undefined,
        autreEmplacement_ec_num: data.autreEmplacement_ec_num || undefined,
        autreEmplacement_ec: data.autreEmplacement_ec && data.autreEmplacement_ec > 0 ? data.autreEmplacement_ec : undefined,
      };

      await setReleveOccupant(releveData);
      setIsSuccess(true);
    } catch (_error) {// eslint-disable-line @typescript-eslint/no-unused-vars
      // L'erreur est déjà gérée par le hook useOccupant
      // Mais on peut définir une erreur au niveau du formulaire si nécessaire
      setError("root", {
        type: "manual",
        message:
          releveError ||
          "Une erreur s'est produite lors de l'envoi du relevé. Veuillez réessayer.",
      });
    }
  };

  // Afficher le message d'erreur du hook ou de la validation du formulaire
  const displayError = releveError || errors.root?.message;
  const isLoading = isSubmitting || isSubmittingReleve;

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-4xl mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Transmettre votre relevé de compteurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Le releveur s&apos;est présenté à votre résidence mais n&apos;a pas pu accéder à votre logement pour le relevé de vos compteurs d&apos;eau. Vous avez la possibilité de relever et nous transmettre via le formulaire ci-dessous votre consommation d&apos;eau.
            </p>
          </div>
          <div>
            {/* Message de succès */}
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Relevé envoyé"
                  message="Votre relevé de compteurs a été transmis avec succès. Merci pour votre collaboration."
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1 : Informations Immeuble */}
                <fieldset className="space-y-4 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                  <legend className="font-bold text-lg text-gray-800 dark:text-white/90 px-2">
                    Informations Immeuble
                  </legend>
                  
                  <div>
                    <Label htmlFor="numeroImmeuble">
                      N° Immeuble <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="numeroImmeuble"
                      type="text"
                      placeholder="N° Immeuble"
                      {...register("numeroImmeuble")}
                      error={!!errors.numeroImmeuble}
                      hint={errors.numeroImmeuble?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="batiment">Bâtiment</Label>
                    <Input
                      id="batiment"
                      type="text"
                      placeholder="Bâtiment"
                      {...register("batiment")}
                      error={!!errors.batiment}
                      hint={errors.batiment?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="escalier">Escalier</Label>
                    <Input
                      id="escalier"
                      type="text"
                      placeholder="Escalier"
                      {...register("escalier")}
                      error={!!errors.escalier}
                      hint={errors.escalier?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="etage">Étage</Label>
                    <Input
                      id="etage"
                      type="text"
                      placeholder="Étage"
                      {...register("etage")}
                      error={!!errors.etage}
                      hint={errors.etage?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="datePassage">
                      Date de passage <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="datePassage"
                      type="date"
                      {...register("datePassage")}
                      error={!!errors.datePassage}
                      hint={errors.datePassage?.message}
                    />
                  </div>
                </fieldset>

                {/* Section 2 : Informations Occupant */}
                <fieldset className="space-y-4 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                  <legend className="font-bold text-lg text-gray-800 dark:text-white/90 px-2">
                    Informations Occupant
                  </legend>
                  
                  <div>
                    <Label htmlFor="prenom">
                      Prénom <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="prenom"
                      type="text"
                      placeholder="Prénom"
                      {...register("prenom")}
                      error={!!errors.prenom}
                      hint={errors.prenom?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nom">
                      Nom <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="nom"
                      type="text"
                      placeholder="Nom"
                      {...register("nom")}
                      error={!!errors.nom}
                      hint={errors.nom?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse">
                      Adresse <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="adresse"
                      type="text"
                      placeholder="Adresse"
                      {...register("adresse")}
                      error={!!errors.adresse}
                      hint={errors.adresse?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="codePostal">
                      Code Postal <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="codePostal"
                      type="text"
                      placeholder="Code Postal"
                      {...register("codePostal")}
                      error={!!errors.codePostal}
                      hint={errors.codePostal?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ville">
                      Ville <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="ville"
                      type="text"
                      placeholder="Ville"
                      {...register("ville")}
                      error={!!errors.ville}
                      hint={errors.ville?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telephone">
                      Téléphone <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="Téléphone"
                      {...register("telephone")}
                      error={!!errors.telephone}
                      hint={errors.telephone?.message}
                    />
                  </div>

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
                </fieldset>

                {/* Section 3 : Compteurs Eau Froide */}
                <fieldset className="space-y-4 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                  <legend className="font-bold text-lg text-gray-800 dark:text-white/90 px-2">
                    Compteurs Eau Froide
                  </legend>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cuisine_ef_num">Cuisine - N° compteur</Label>
                      <Input
                        id="cuisine_ef_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("cuisine_ef_num")}
                        error={!!errors.cuisine_ef_num}
                        hint={errors.cuisine_ef_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine_ef">Cuisine - m³</Label>
                      <Input
                        id="cuisine_ef"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("cuisine_ef", { valueAsNumber: true })}
                        error={!!errors.cuisine_ef}
                        hint={errors.cuisine_ef?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salleDeBains_ef_num">Salle de bains - N° compteur</Label>
                      <Input
                        id="salleDeBains_ef_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("salleDeBains_ef_num")}
                        error={!!errors.salleDeBains_ef_num}
                        hint={errors.salleDeBains_ef_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salleDeBains_ef">Salle de bains - m³</Label>
                      <Input
                        id="salleDeBains_ef"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("salleDeBains_ef", { valueAsNumber: true })}
                        error={!!errors.salleDeBains_ef}
                        hint={errors.salleDeBains_ef?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wc_ef_num">WC - N° compteur</Label>
                      <Input
                        id="wc_ef_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("wc_ef_num")}
                        error={!!errors.wc_ef_num}
                        hint={errors.wc_ef_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wc_ef">WC - m³</Label>
                      <Input
                        id="wc_ef"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("wc_ef", { valueAsNumber: true })}
                        error={!!errors.wc_ef}
                        hint={errors.wc_ef?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="autreEmplacement_ef_loc">Autre emplacement - Localisation</Label>
                      <Input
                        id="autreEmplacement_ef_loc"
                        type="text"
                        placeholder="Localisation"
                        {...register("autreEmplacement_ef_loc")}
                        error={!!errors.autreEmplacement_ef_loc}
                        hint={errors.autreEmplacement_ef_loc?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="autreEmplacement_ef_num">Autre emplacement - N° compteur</Label>
                      <Input
                        id="autreEmplacement_ef_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("autreEmplacement_ef_num")}
                        error={!!errors.autreEmplacement_ef_num}
                        hint={errors.autreEmplacement_ef_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="autreEmplacement_ef">Autre emplacement - m³</Label>
                      <Input
                        id="autreEmplacement_ef"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("autreEmplacement_ef", { valueAsNumber: true })}
                        error={!!errors.autreEmplacement_ef}
                        hint={errors.autreEmplacement_ef?.message}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Section 4 : Compteurs Eau Chaude */}
                <fieldset className="space-y-4 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
                  <legend className="font-bold text-lg text-gray-800 dark:text-white/90 px-2">
                    Compteurs Eau Chaude
                  </legend>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cuisine_ec_num">Cuisine - N° compteur</Label>
                      <Input
                        id="cuisine_ec_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("cuisine_ec_num")}
                        error={!!errors.cuisine_ec_num}
                        hint={errors.cuisine_ec_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine_ec">Cuisine - m³</Label>
                      <Input
                        id="cuisine_ec"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("cuisine_ec", { valueAsNumber: true })}
                        error={!!errors.cuisine_ec}
                        hint={errors.cuisine_ec?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salleDeBains_ec_num">Salle de bains - N° compteur</Label>
                      <Input
                        id="salleDeBains_ec_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("salleDeBains_ec_num")}
                        error={!!errors.salleDeBains_ec_num}
                        hint={errors.salleDeBains_ec_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salleDeBains_ec">Salle de bains - m³</Label>
                      <Input
                        id="salleDeBains_ec"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("salleDeBains_ec", { valueAsNumber: true })}
                        error={!!errors.salleDeBains_ec}
                        hint={errors.salleDeBains_ec?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wc_ec_num">WC - N° compteur</Label>
                      <Input
                        id="wc_ec_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("wc_ec_num")}
                        error={!!errors.wc_ec_num}
                        hint={errors.wc_ec_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wc_ec">WC - m³</Label>
                      <Input
                        id="wc_ec"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("wc_ec", { valueAsNumber: true })}
                        error={!!errors.wc_ec}
                        hint={errors.wc_ec?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="autreEmplacement_ec_loc">Autre emplacement - Localisation</Label>
                      <Input
                        id="autreEmplacement_ec_loc"
                        type="text"
                        placeholder="Localisation"
                        {...register("autreEmplacement_ec_loc")}
                        error={!!errors.autreEmplacement_ec_loc}
                        hint={errors.autreEmplacement_ec_loc?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="autreEmplacement_ec_num">Autre emplacement - N° compteur</Label>
                      <Input
                        id="autreEmplacement_ec_num"
                        type="text"
                        placeholder="N° compteur"
                        {...register("autreEmplacement_ec_num")}
                        error={!!errors.autreEmplacement_ec_num}
                        hint={errors.autreEmplacement_ec_num?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="autreEmplacement_ec">Autre emplacement - m³</Label>
                      <Input
                        id="autreEmplacement_ec"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="m³"
                        {...register("autreEmplacement_ec", { valueAsNumber: true })}
                        error={!!errors.autreEmplacement_ec}
                        hint={errors.autreEmplacement_ec?.message}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Bouton de soumission */}
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer le relevé"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

