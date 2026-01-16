import LoginForm from "@/components/techem/security/form/login";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion | TECHEM - Espace client",
  description: "Connectez-vous à votre compte Techem",
};

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chargement...
        </p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
