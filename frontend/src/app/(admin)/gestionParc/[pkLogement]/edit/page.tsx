import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Logement | TECHEM - Espace client",
  description: "Edit housing unit",
};

export default function EditLogementPage({
  params,
}: {
  params: { pkLogement: string };
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}

