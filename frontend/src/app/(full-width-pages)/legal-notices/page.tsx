import { Metadata } from "next";
import LegalNotices from "@/components/legal/LegalNotices";

export const metadata: Metadata = {
  title: "Mentions légales | TECHEM - Espace client",
  description: "Mentions légales du site TECHEM",
};

export default function LegalNoticesPage() {
  return <LegalNotices />;
}

