"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
        const authData = JSON.parse(authStorage);
        const user = authData?.state?.user;

        if (user?.UserType) {
          const userType = String(user.UserType);
          if (userType === "C" || userType === "G") {
            console.log("Redirecting to /parc for user type:", userType);
            router.replace("/parc");
          } else if (userType === "O") {
            console.log("Redirecting to /occupant for user type:", userType);
            router.replace("/occupant");
          } else {
            console.log("Unknown user type:", userType);
            router.replace("/login");
          }
        } else {
          console.log("User type not found in auth data.");
          router.replace("/login");
        }
    } else {
      console.log("No auth data found in localStorage.");
      router.replace("/login");
    }
  }, [router]);

  return null;
}