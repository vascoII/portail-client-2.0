import { Metadata } from "next";
import CGUPageClient from "./CGUPageClient";

export const metadata: Metadata = {
  title: "CGU | TECHEM - Espace client",
  description: "Conditions générales d'utilisation",
};

export default function CGUPage() {
  return <CGUPageClient />;
}

