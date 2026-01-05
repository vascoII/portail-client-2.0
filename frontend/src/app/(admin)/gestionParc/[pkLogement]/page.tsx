import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logement Gestion | TECHEM - Espace client",
  description: "Housing unit management",
};

export default function GestionParcLogementPage({
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

