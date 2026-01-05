import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Declare Occupant | TECHEM - Espace client",
  description: "Declare occupant",
};

export default function DeclareOccupantPage({
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

