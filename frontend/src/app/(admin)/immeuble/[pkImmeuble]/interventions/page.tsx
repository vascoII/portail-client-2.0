import { Metadata } from "next";

import ListInterventions from "@/components/techem/immeuble/ListInterventions";

export const metadata: Metadata = {
  title: "Interventions | TECHEM - Espace client",
  description: "List of interventions",
};

export default async function ImmeubleInterventionsPage({
  params,
}: {
  params: Promise<{ pkImmeuble: string }>;
}) {
  const { pkImmeuble } = await params;
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkImmeuble={pkImmeuble} />
      </div>
    </div>
  );
}

