import type { Metadata } from "next"; 
import React from "react";

import { AdminRedirect } from "@/components/auth/AdminRedirect";

export const metadata: Metadata = {
  title: "Techem Portail Client",
  description: "Techem Portail Client",
};

export default function Ecommerce() {
  return (
    <>
      <AdminRedirect />

    </>
  );
}
