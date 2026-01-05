"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import { useLogements } from "@/lib/hooks/useLogements";
import { handleApiError } from "@/lib/api/client";

/**
 * Schéma de validation pour le formulaire de création de ticket
 * Règles :
 * - Nom requis
 * - Email requis et valide
 * - Au moins un des deux champs téléphone doit être rempli
 * - Objet requis
 * - Message requis
 * - Pièce jointe optionnelle (docx, xlsx, pdf, png, jpg, gif, max 2 MB)
 */
const createTicketSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Veuillez entrer une adresse email valide"),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    objet: z.string().min(1, "L'objet est requis"),
    message: z.string().min(1, "Le message est requis"),
    attachment: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => {
          if (!file) return true;
          const validTypes = [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/pdf", // .pdf
            "image/png", // .png
            "image/jpeg", // .jpg
            "image/jpg", // .jpg
            "image/gif", // .gif
          ];
          return validTypes.includes(file.type);
        },
        {
          message:
            "Format de fichier non supporté. Formats acceptés : docx, xlsx, pdf, png, jpg, gif",
        }
      )
      .refine(
        (file) => {
          if (!file) return true;
          const maxSize = 2 * 1024 * 1024; // 2 MB
          return file.size <= maxSize;
        },
        {
          message: "La taille du fichier ne doit pas dépasser 2 MB",
        }
      ),
  })
  .refine((data) => data.phone || data.mobile, {
    message: "Au moins un des deux champs téléphone doit être rempli",
    path: ["phone"],
  });

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkLogement: string | number;
  onSuccess?: () => void;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  pkLogement,
  onSuccess,
}: CreateTicketModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      objet: "",
      message: "",
      attachment: undefined,
    },
  });

  const { createTicket, isCreatingTicket } = useLogements();

  // Surveiller les valeurs des téléphones pour la validation
  const phone = watch("phone");
  const mobile = watch("mobile");

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSuccess(false);
      setSelectedFile(null);
    }
  }, [isOpen, reset]);

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      await createTicket(pkLogement, {
        pkLogement,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        mobile: data.mobile || undefined,
        objet: data.objet,
        message: data.message,
      }, data.attachment || undefined);

      setIsSuccess(true);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message: errorMessage || "Une erreur s'est produite lors de la création du ticket.",
      });
    }
  };

  /**
   * Gestion du changement de fichier
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const isLoading = isSubmitting || isCreatingTicket;
  const displayError = errors.root?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Demande d&apos;intervention
        </h4>

        {/* Message de succès */}
        {isSuccess && (
          <div className="mb-6">
            <Alert
              variant="success"
              title="Demande envoyée"
              message="Votre demande d'intervention a été envoyée avec succès."
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
            <div className="space-y-5">
              {/* Champ Nom */}
              <div>
                <Label htmlFor="name">
                  Nom <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nom"
                  {...register("name")}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>

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

              {/* Champs Téléphone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Téléphone fixe</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Téléphone fixe"
                    {...register("phone")}
                    error={!!errors.phone}
                    hint={errors.phone?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Téléphone mobile</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Téléphone mobile"
                    {...register("mobile")}
                    error={!!errors.mobile}
                    hint={errors.mobile?.message}
                  />
                </div>
              </div>
              {(!phone && !mobile) && errors.phone && (
                <p className="text-xs text-error-500">
                  * Remplir au moins un des deux champs téléphone
                </p>
              )}

              {/* Champ Objet */}
              <div>
                <Label htmlFor="objet">
                  Objet <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="objet"
                  type="text"
                  placeholder="Objet"
                  {...register("objet")}
                  error={!!errors.objet}
                  hint={errors.objet?.message}
                />
              </div>

              {/* Champ Message */}
              <div>
                <Label htmlFor="message">
                  Demande <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Demande"
                      rows={5}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.message}
                      hint={errors.message?.message}
                    />
                  )}
                />
              </div>

              {/* Champ Pièce jointe */}
              <div>
                <Label htmlFor="attachment">Pièce jointe (optionnel)</Label>
                <Controller
                  name="attachment"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div>
                      <FileInput
                        {...field}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleFileChange(e);
                          onChange(file);
                        }}
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Fichier sélectionné : {selectedFile.name}
                        </p>
                      )}
                      {errors.attachment && (
                        <p className="mt-1.5 text-xs text-error-500">
                          {errors.attachment.message}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        * Formats supportés : docx | xlsx | pdf | png | jpg | gif,
                        taille maximale : 2 MB
                      </p>
                    </div>
                  )}
                />
              </div>

              {/* Boutons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? "Envoi en cours..." : "Envoyer"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

