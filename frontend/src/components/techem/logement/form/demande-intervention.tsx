"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
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
        <h4 className="mb-6 text-xl font-normal text-[#1d1914]">
          Demande d&apos;intervention
        </h4>

        {/* Message de succès */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-[#417232] text-white rounded-lg">
            <p className="font-medium mb-1">Demande envoyée</p>
            <p className="text-sm">Votre demande d&apos;intervention a été envoyée avec succès.</p>
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
            <div className="space-y-5">
              {/* Champ Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-normal text-[#1d1914] mb-2">
                  Nom <span className="text-[#b00511]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nom"
                  {...register("name")}
                  disabled={true}
                  className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-[#e9ecef] cursor-not-allowed ${
                    errors.name ? "border-[#b00511]" : "border-[#1d1914]"
                  } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[#b00511]">{errors.name.message}</p>
                )}
              </div>

              {/* Champ Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-normal text-[#1d1914] mb-2">
                  Email <span className="text-[#b00511]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
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
                  placeholder="Téléphone"
                  {...register("phone")}
                  className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                    errors.phone ? "border-[#b00511]" : "border-[#1d1914]"
                  } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#b00511]">{errors.phone.message}</p>
                )}
              </div>

              {/* Champ Objet */}
              <div>
                <label htmlFor="objet" className="block text-sm font-normal text-[#1d1914] mb-2">
                  Objet <span className="text-[#b00511]">*</span>
                </label>
                <input
                  id="objet"
                  type="text"
                  placeholder="Objet"
                  {...register("objet")}
                  className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1d1914] bg-white ${
                    errors.objet ? "border-[#b00511]" : "border-[#1d1914]"
                  } focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent`}
                />
                {errors.objet && (
                  <p className="mt-1 text-xs text-[#b00511]">{errors.objet.message}</p>
                )}
              </div>

              {/* Champ Demande */}
              <div>
                <label htmlFor="message" className="block text-sm font-normal text-[#1d1914] mb-2">
                  Demande <span className="text-[#b00511]">*</span>
                </label>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <>
                      <TextArea
                        placeholder="Demande"
                        rows={5}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.message}
                        hint={errors.message?.message}
                      />
                    </>
                  )}
                />
              </div>

              {/* Boutons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg border border-[#1d1914] text-sm font-normal transition-all duration-300 ${
                    isLoading
                      ? "bg-[#e9ecef] text-[#6a6a6a] cursor-not-allowed"
                      : "bg-white text-[#1d1914] hover:bg-[#ffe5e6] hover:text-[#e20613]"
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-normal text-white transition-all duration-300 ${
                    isLoading
                      ? "bg-[#6a6a6a] cursor-not-allowed"
                      : "bg-[#1d1914] hover:bg-[#e20613]"
                  }`}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

