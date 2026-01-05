import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | TECHEM - Espace client",
  description: "Change manager password",
};

export default function GestionnairePasswordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}

