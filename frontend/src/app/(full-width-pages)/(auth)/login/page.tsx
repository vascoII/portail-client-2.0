import LoginForm from "@/components/techem/security/form/login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | TECHEM - Espace client",
  description: "Connectez-vous à votre compte Techem",
};

export default function Login() {
  return <LoginForm />;
}
