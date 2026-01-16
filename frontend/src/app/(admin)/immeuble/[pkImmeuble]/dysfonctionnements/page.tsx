import { Metadata } from "next";

import ListDysfonctionnements from "@/components/techem/immeuble/ListDysfonctionnements";

export const metadata: Metadata = {
  title: "Dysfonctionnements | TECHEM - Espace client",
  description: "List of dysfunctions",
};

export default async function ImmeubleDysfonctionnementsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string }>;
}) {
  const { pkImmeuble } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListDysfonctionnements pkImmeuble={pkImmeuble} />
      </div>
    </div>
  );
}

