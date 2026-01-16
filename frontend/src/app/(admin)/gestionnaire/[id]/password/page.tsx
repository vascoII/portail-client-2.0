import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | TECHEM - Espace client",
  description: "Change manager password",
};

export default async function GestionnairePasswordPage({
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

