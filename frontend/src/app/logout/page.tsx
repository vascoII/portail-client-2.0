"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, hasHydrated } = useAuth();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;

    logout().catch(() => {
      // Even if logout fails, ensure user lands on login page
      router.replace("/login");
    });
  }, [hasHydrated, logout, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="space-y-3">
        <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Déconnexion en cours…
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Merci de patienter pendant que nous sécurisons votre session.
        </p>
      </div>
    </div>
  );
}


