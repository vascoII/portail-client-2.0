import { Metadata } from "next";
import Rgpd from "@/components/techem/rgpd/Rgpd";

export const metadata: Metadata = {
  title: "RGPD | TECHEM - Espace client",
  description: "Protection des données personnelles - RGPD",
};

export default function RgpdPage() {
  return <Rgpd />;
}

