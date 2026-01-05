import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | TECHEM - Espace client Portal",
  description: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}

