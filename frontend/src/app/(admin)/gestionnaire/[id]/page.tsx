import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestionnaire Details | TECHEM - Espace client",
  description: "Manager details",
};

export default async function GestionnaireDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}

