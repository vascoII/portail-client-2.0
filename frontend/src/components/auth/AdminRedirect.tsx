"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userType = window.localStorage.getItem("userType");

    if (userType === "C" || userType === "G") {
      router.replace("/parc");
    } else if (userType === "O") {
      router.replace("/occupant");
    }
  }, [router]);

  return null;
}

