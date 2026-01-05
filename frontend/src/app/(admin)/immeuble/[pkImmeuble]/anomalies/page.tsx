import { Metadata } from "next";

import ListAnomalies from "@/components/techem/immeuble/ListAnomalies";

export const metadata: Metadata = {
  title: "Anomalies | TECHEM - Espace client",
  description: "List of anomalies",
};

export default function ImmeubleAnomaliesPage({
  params,
}: {
  params: { pkImmeuble: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListAnomalies pkImmeuble={params.pkImmeuble} />
      </div>
    </div>
  );
}

