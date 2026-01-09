import ResetPasswordForm from "@/components/techem/security/form/reset-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | TECHEM - Espace client",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
