"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Alert from "@/components/ui/alert/Alert";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useSecurity } from "@/lib/hooks/useSecurity";

// Même logique de validation que le formulaire global de mise à jour de mot de passe
const updatePasswordSchema = z.object({
  password: z
    .object({
      first: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
      second: z.string().min(1, "La confirmation du mot de passe est requise"),
    })
    .refine((data) => data.first === data.second, {
      message: "Les mots de passe ne correspondent pas",
      path: ["second"],
    }),
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UserPasswordCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: {
        first: "",
        second: "",
      },
    },
  });

  const { updatePassword, isUpdatingPassword, updatePasswordError } =
    useSecurity();

  const passwordFirst = watch("password.first");
  const passwordSecond = watch("password.second");

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      await updatePassword({
        first: data.password.first,
        second: data.password.second,
      });
      setIsSuccess(true);
      reset();
    } catch (error) {
      setError("root", {
        type: "manual",
        message:
          updatePasswordError ||
          "Une erreur s'est produite lors de la mise à jour du mot de passe.",
      });
    }
  };

  const displayError = updatePasswordError || errors.root?.message;
  const isLoading = isSubmitting || isUpdatingPassword;

  const handleCloseModal = () => {
    setIsSuccess(false);
    reset();
    closeModal();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-2">
            Mot de passe
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Modifiez le mot de passe de votre compte.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.99967 2.25C7.21481 2.25 5.74967 3.71514 5.74967 5.5V7.25H5.24967C4.00701 7.25 3.0 8.257 3.0 9.49967V13.2497C3.0 14.4923 4.00701 15.4993 5.24967 15.4993H12.7497C13.9923 15.4993 14.9993 14.4923 14.9993 13.2497V9.49967C14.9993 8.257 13.9923 7.25 12.7497 7.25H12.2497V5.5C12.2497 3.71514 10.7845 2.25 8.99967 2.25ZM7.24967 5.5C7.24967 4.50736 8.00703 3.75 8.99967 3.75C9.9923 3.75 10.7497 4.50736 10.7497 5.5V7.25H7.24967V5.5Z"
              fill=""
            />
          </svg>
          Modifier le mot de passe
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modification du mot de passe
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Définissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          {isSuccess && (
            <div className="mb-6 px-2">
              <Alert
                variant="success"
                title="Mot de passe modifié"
                message="Votre mot de passe a été modifié avec succès."
              />
            </div>
          )}

          {displayError && !isSuccess && (
            <div className="mb-6 px-2">
              <Alert
                variant="error"
                title="Erreur"
                message={displayError}
              />
            </div>
          )}

          {!isSuccess && (
            <div className="mb-6 px-2">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Rappel :</strong> Votre mot de passe doit être composé
                  d&apos;au moins 8 caractères et contenir au moins une
                  majuscule, une minuscule et un chiffre.
                </p>
              </div>
            </div>
          )}

          {!isSuccess && (
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <div className="custom-scrollbar h-[350px] overflow-y-auto px-2 pb-3">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="password.first">
                      Nouveau mot de passe{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.first"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre nouveau mot de passe"
                        {...register("password.first")}
                        error={!!errors.password?.first}
                        hint={errors.password?.first?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password.second">
                      Confirmation du mot de passe{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password.second"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Confirmez votre nouveau mot de passe"
                        {...register("password.second")}
                        error={!!errors.password?.second}
                        hint={errors.password?.second?.message}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        aria-label={
                          showPasswordConfirm
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPasswordConfirm ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordFirst &&
                      passwordSecond &&
                      passwordFirst !== passwordSecond && (
                        <p className="mt-1.5 text-xs text-error-500">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" type="button" onClick={handleCloseModal}>
                  Fermer
                </Button>
                <Button size="sm" type="submit" disabled={isLoading}>
                  {isLoading ? "Modification en cours..." : "Modifier"}
                </Button>
              </div>
            </form>
          )}

          {isSuccess && (
            <div className="flex items-center justify-end gap-3 px-2 mt-6">
              <Button size="sm" variant="primary" type="button" onClick={handleCloseModal}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

