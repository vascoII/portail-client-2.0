import { Metadata } from "next";

import ListInterventions from "@/components/techem/immeuble/ListInterventions";

export const metadata: Metadata = {
  title: "Interventions | TECHEM - Espace client",
  description: "List of interventions",
};

export default function ImmeubleInterventionsPage({
  params,
}: {
  params: { pkImmeuble: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListInterventions pkImmeuble={params.pkImmeuble} />
      </div>
    </div>
  );
}

