"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import TextArea from "@/components/form/input/TextArea";
import { api, handleApiError } from "@/lib/api/client";

/**
 * Schéma de validation pour le formulaire de demande d'intervention
 * Règles :
 * - Nom requis
 * - Email requis et valide
 * - Téléphone requis
 * - Objet requis
 * - Demande requise
 */
const demandeInterventionSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),
  phone: z.string().min(1, "Le téléphone est requis"),
  objet: z.string().min(1, "L'objet est requis"),
  message: z.string().min(1, "La demande est requise"),
});

type DemandeInterventionFormData = z.infer<typeof demandeInterventionSchema>;

export interface DemandeInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkLogement: string | number;
  occupantNom?: string;
  onSuccess?: () => void;
}

export default function DemandeInterventionModal({
  isOpen,
  onClose,
  pkLogement,
  occupantNom = "",
  onSuccess,
}: DemandeInterventionModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setValue,
  } = useForm<DemandeInterventionFormData>({
    resolver: zodResolver(demandeInterventionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      objet: "",
      message: "",
    },
  });

  // Pré-remplir le champ nom avec occupantNom quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && occupantNom) {
      setValue("name", occupantNom);
    }
  }, [isOpen, occupantNom, setValue]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: DemandeInterventionFormData) => {
      const formData = new FormData();
      
      // Add form data with intervention prefix
      formData.append("intervention[pkLogement]", String(pkLogement));
      formData.append("intervention[name]", data.name);
      formData.append("intervention[email]", data.email);
      formData.append("intervention[phone]", data.phone);
      formData.append("intervention[objet]", data.objet);
      formData.append("intervention[message]", data.message);

      const response = await api.post(
        `/logements/${pkLogement}/tickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    },
  });

  const onSubmit = async (data: DemandeInterventionFormData) => {
    try {
      await createTicketMutation.mutateAsync(data);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        reset();
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError("root", {
        type: "manual",
        message:
          errorMessage ||
          "Une erreur s'est produite lors de l'envoi de la demande d'intervention.",
      });
    }
  };

  const isLoading = isSubmitting || createTicketMutation.isPending;
  const displayError = errors.root?.message;

  const handleClose = () => {
    reset();
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
                  disabled={true}
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

              {/* Champ Téléphone */}
              <div>
                <Label htmlFor="phone">
                  Téléphone <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Téléphone"
                  {...register("phone")}
                  error={!!errors.phone}
                  hint={errors.phone?.message}
                />
              </div>

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

              {/* Champ Demande */}
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

              {/* Boutons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
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

