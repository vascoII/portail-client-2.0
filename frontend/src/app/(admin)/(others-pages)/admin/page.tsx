import AdminParcCard from "@/components/admin-profile/AdminParcCard";
import AdminImmeubleCard from "@/components/admin-profile/AdminImmeubleCard";
import AdminLogementCard from "@/components/admin-profile/AdminLogementCard";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Administration | TECHEM - Espace client",
  description: "Administration",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Administration
        </h3>
        <div className="space-y-6">
          <AdminParcCard />
          <AdminImmeubleCard />
          <AdminLogementCard />
        </div>
      </div>
    </div>
  );
}
