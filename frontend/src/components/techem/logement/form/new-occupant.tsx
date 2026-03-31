
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

// DatePicker
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Schéma Zod
 */
const newOccupantSchema = z.object({
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
  dateArrivee: z.date().nullable().optional(), // <-- Modifié pour DatePicker
});

type NewOccupantFormData = z.infer<typeof newOccupantSchema>;

interface NewOccupantFormProps {
  pkLogement: string;
}

export default function NewOccupantForm({ pkLogement }: NewOccupantFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<NewOccupantFormData>({
    resolver: zodResolver(newOccupantSchema),
    defaultValues: {
      nameOccupant: "",
      email: "",
      phone: "",
      CodeLogeGestio: "",
      numBail: "",
      dateArrivee: null, // <-- par défaut null
    },
  });

  const {
    useLogementQuery,
    useOccupantDetailsQuery,
    updateOccupant,
    isUpdatingOccupant,
    updateOccupantError,
  } = useLogements();

  // Charger les données du logement pour récupérer pkImmeuble
  const { data: logementData } = useLogementQuery(pkLogement);

  // Préchargement via getOccupants(..., true) pour proposer les valeurs issues du WS
  const { data: occupantDetailsData } = useOccupantDetailsQuery(pkLogement, true);

  const pkImmeuble =
    logementData?.logement?.Immeuble?.PkImmeuble ??
    "";

  // Pré-remplir Email / Téléphone si disponibles depuis l'endpoint details
  useEffect(() => {
    const details = occupantDetailsData?.occupant ?? {};
    const currentName = watch("nameOccupant");
    const currentEmail = watch("email");
    const currentPhone = watch("phone");
    const currentCode = watch("CodeLogeGestio");
    const currentBail = watch("numBail");
    const currentDate = watch("dateArrivee");

    const nameOccupant = details.newNom ?? details.Nom ?? "";

    const email = details.newEmail ?? details.email ?? details.Email ?? "";

    const phone =
      details.newTelmobile ??
      details.newTelMobile ??
      details.telmobile ??
      details.telfixe ??
      details.newTelfixe ??
      details.TelMobile ??
      details.TelFixe ??
      "";

    const codeLogeGestio =
      details.newCodeLogeGestio ??
      details.CodeLogeGestio ??
      "";

    const numBail =
      details.newNumbail ??
      details.numbail ??
      "";

    const parseDate = (value: unknown): Date | null => {
      if (!value || typeof value !== "string") return null;
      // Le WS utilise parfois 0001-01-01T00:00:00 comme "vide"
      if (value.startsWith("0001-01-01")) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const dateArrivee =
      parseDate(details.newDateArrivee) ??
      parseDate(details.DateArrivee) ??
      null;

    if (!currentName && nameOccupant) setValue("nameOccupant", nameOccupant);
    if (!currentEmail && email) setValue("email", email);
    if (!currentPhone && phone) setValue("phone", phone);
    if (!currentCode && codeLogeGestio) setValue("CodeLogeGestio", codeLogeGestio);
    if (!currentBail && numBail) setValue("numBail", numBail);

    // Si aucune date n'est encore posée, on prend celle du WS sinon aujourd'hui
    if (!currentDate) {
      setValue("dateArrivee", dateArrivee ?? new Date());
    }
  }, [occupantDetailsData, setValue, watch]);

  /**
   * Soumission
   */
  const onSubmit = async (data: NewOccupantFormData) => {
    try {
      const occupantData: any = {// eslint-disable-line @typescript-eslint/no-explicit-any
        newNom: data.nameOccupant,
        newTelmobile: data.phone,
      };

      if (data.email?.trim()) {
        occupantData.newEmail = data.email;
      }

      if (data.CodeLogeGestio?.trim()) {
        occupantData.CodeLogeGestio = data.CodeLogeGestio;
      }

      if (data.numBail?.trim()) {
        occupantData.numBail = data.numBail;
      }

      // Format API : yyyy-MM-dd
      if (data.dateArrivee instanceof Date) {
        occupantData.dateArrivee = format(data.dateArrivee, "yyyy-MM-dd");
      }
      occupantData.isNew = true;
      await updateOccupant(pkLogement, occupantData);
      setIsSuccess(true);

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
          updateOccupantError ??
          errorMessage ??
          "Une erreur s'est produite lors de la déclaration de l'occupant.",
      });
    }
  };

  const isLoading = isSubmitting || isUpdatingOccupant;
  const displayError = updateOccupantError ?? errors.root?.message;

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
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Nouvel occupant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remplissez les informations pour déclarer un nouvel occupant
            </p>
          </div>

          <div>
            {isSuccess && (
              <div className="mb-6">
                <Alert
                  variant="success"
                  title="Occupant déclaré"
                  message="L'occupant a été déclaré avec succès. Redirection en cours..."
                />
              </div>
            )}

            {displayError && !isSuccess && (
              <div className="mb-6">
                <Alert variant="error" title="Erreur" message={displayError} />
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Nom */}
                  <div>
                    <Label htmlFor="nameOccupant">
                      Nom de l&apos;occupant <span className="text-error-500">*</span>
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

                  {/* Email */}
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

                  {/* Téléphone */}
                  <div>
                    <Label htmlFor="phone">
                      Téléphone <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Saisir un numéro (10 chiffres)"
                      {...register("phone")}
                      error={!!errors.phone}
                      hint={errors.phone?.message ?? "10 chiffres requis"}
                      maxLength={10}
                    />
                  </div>

                  {/* CodeLogeGestio */}
                  <div>
                    <Label htmlFor="CodeLogeGestio">
                      Numéro de logement unique
                    </Label>
                    <Input
                      id="CodeLogeGestio"
                      type="text"
                      placeholder="Numéro de logement unique"
                      {...register("CodeLogeGestio")}
                      error={!!errors.CodeLogeGestio}
                      hint={errors.CodeLogeGestio?.message}
                    />
                  </div>

                  {/* numBail */}
                  <div>
                    <Label htmlFor="numBail">Numéro de bail</Label>
                    <Input
                      id="numBail"
                      type="text"
                      placeholder="Saisir un numéro de bail"
                      {...register("numBail")}
                      error={!!errors.numBail}
                      hint={errors.numBail?.message}
                    />
                  </div>

                  {/* Date Picker */}
                  <div>
                    <Label htmlFor="dateArrivee">Date d&apos;arrivée</Label>

                    <DatePicker
                      id="dateArrivee"
                      selected={watch("dateArrivee")}
                      onChange={(d: Date | null) => setValue("dateArrivee", d)}
                      dateFormat="dd/MM/yyyy"
                      locale={fr}
                      placeholderText="JJ/MM/AAAA"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700
                                 focus:border-brand-500 focus:outline-none dark:border-gray-700
                                 dark:bg-gray-900 dark:text-gray-200"
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />

                    {errors.dateArrivee && (
                      <p className="text-sm text-error-500 mt-1">
                        {errors.dateArrivee.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <Button
                      className="w-full sm:w-auto"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Validation en cours..." : "Valider"}
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
