import { Metadata } from "next";
import PersonalDatas from "@/components/legal/PersonalDatas";

export const metadata: Metadata = {
  title: "Personal Data | TECHEM - Espace client",
  description: "Personal data information",
};

export default function PersonalDatasPage() {
  return <PersonalDatas />;
}

