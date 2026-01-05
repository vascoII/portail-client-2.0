import { Metadata } from "next";

import ListFuites from "@/components/techem/immeuble/ListFuites";

export const metadata: Metadata = {
  title: "Fuites | TECHEM - Espace client",
  description: "List of leaks",
};

export default function ImmeubleFuitesPage({
  params,
}: {
  params: { pkImmeuble: string };
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <ListFuites pkImmeuble={params.pkImmeuble} />
      </div>
    </div>
  );
}

