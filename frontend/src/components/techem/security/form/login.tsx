"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Schéma de validation pour le formulaire de connexion
 */
const loginSchema = z.object({
  username: z
    .string()
    .min(1, "L'email ou le login est requis"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || null;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const { login, error: authError, isLoggingIn, isAuthenticated, roles, user, sessionId, hasHydrated } = useAuth();

  // TEMPORARILY DISABLED: Vérifier le store au chargement de la page (stateless - pas d'appel serveur)
  // TODO: Re-enable after fixing the redirect loop issue
  /*
  useEffect(() => {
    // Wait for store to be hydrated and not currently logging in
    if (!hasHydrated || isLoggingIn) {
      return;
    }

    setIsCheckingSession(true);
    
    // Vérifier uniquement le store local (pas d'appel API)
    // Si l'utilisateur a des données dans le store, il est considéré comme authentifié
    if (isAuthenticated && user && sessionId) {
      // Utilisateur authentifié dans le store, rediriger selon le rôle
      // Only redirect if we have a valid redirect path or default path
      const redirectPath = redirect || (roles?.includes("ROLE_OCCUPANT") ? "/occupant" : "/parc");
      // Use replace instead of push to avoid adding to history
      router.replace(redirectPath);
    } else {
      // Pas d'authentification dans le store, afficher le formulaire
      setIsCheckingSession(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user, sessionId, isLoggingIn, redirect, roles, router]); // Add dependencies to re-check when auth state changes

  // Redirection si authentifié après login (fallback)
  useEffect(() => {
    if (isAuthenticated && !isCheckingSession) {
      const redirectPath = redirect || (roles?.includes("ROLE_OCCUPANT") ? "/occupant" : "/parc");
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirect, roles, isCheckingSession, router]);
  */

  // Always show the login form for now (temporarily disabled auto-redirect)
  useEffect(() => {
    setIsCheckingSession(false);
  }, []);

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        username: data.username,
        password: data.password,
      });
      // La redirection est gérée par le hook useAuth
    } catch {
      // L'erreur est déjà gérée par le hook useAuth
      // Mais on peut définir une erreur au niveau du formulaire si nécessaire
      setError("root", {
        type: "manual",
        message: authError || "La connexion a échoué. Veuillez vérifier vos identifiants.",
      });
    }
  };

  // Afficher le message d'erreur du hook auth ou de la validation du formulaire
  const displayError = authError || errors.root?.message;

  // Afficher un loader pendant la vérification de session
  if (isCheckingSession) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vérification de la session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez votre email ou login et votre mot de passe pour vous connecter !
            </p>
          </div>
          <div>
            {/* Alerte d'erreur */}
            {displayError && (
              <div className="mb-6">
                <Alert
                  variant="error"
                  title="Erreur de connexion"
                  message="La connexion a échoué. Veuillez vérifier vos identifiants."
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Champ Email/Nom d'utilisateur */}
                <div>
                  <Label htmlFor="username">
                    Email ou Login <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Email ou nom d'utilisateur"
                    {...register("username")}
                    error={!!errors.username}
                    hint={errors.username?.message}
                  />
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <Label htmlFor="password">
                    Mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      {...register("password")}
                      error={!!errors.password}
                      hint={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Se souvenir de moi & Mot de passe oublié */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={false}
                      onChange={(checked) => {
                        // Note: La fonctionnalité "Se souvenir de moi" devrait être implémentée
                        // dans le store auth ou l'API si nécessaire
                      }}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Se souvenir de moi
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de soumission */}
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting || isLoggingIn}
                  >
                    {isSubmitting || isLoggingIn ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

