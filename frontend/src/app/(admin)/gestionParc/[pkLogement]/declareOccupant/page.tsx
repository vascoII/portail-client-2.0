import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Declare Occupant | TECHEM - Espace client",
  description: "Declare occupant",
};

export default async function DeclareOccupantPage({
  params,
}: {
  params: Promise<{ pkLogement: string }>;
}) {
  await params;
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}

