"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import AppFooter from "@/layout/AppFooter";
import Backdrop from "@/layout/Backdrop";
// TEMPORARILY DISABLED: Authentication imports
// import { useAuth } from "@/lib/hooks/useAuth";
// import { useRouter, usePathname } from "next/navigation";
import React from "react";
// import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  // TEMPORARILY DISABLED: Authentication check variables
  // const { isAuthenticated, user, sessionId, isLoading, hasHydrated } = useAuth();
  // const router = useRouter();
  // const pathname = usePathname();
  // const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // const [isMounted, setIsMounted] = useState(false);

  // TEMPORARILY DISABLED: Wait for component to mount (client-side only)
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // TEMPORARILY DISABLED: Check authentication on mount and redirect if not authenticated
  // TODO: Re-enable after fixing the redirect loop issue
  /*
  useEffect(() => {
    // Wait for component to mount and store to be fully hydrated
    if (!isMounted || !hasHydrated) {
      return;
    }

    // Check if user is authenticated
    const authenticated = isAuthenticated && user && sessionId;
    
    if (!authenticated) {
      // If not authenticated, redirect to login
      // Only redirect if we're not already on the login page to avoid loops
      if (!pathname.startsWith('/login')) {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }
    } else {
      // User is authenticated, stop checking
      setIsCheckingAuth(false);
    }
  }, [isMounted, hasHydrated, isAuthenticated, user, sessionId, router, pathname]);

  // Show loading state while checking authentication or waiting for store hydration
  if (!hasHydrated || isCheckingAuth || (!isAuthenticated || !user || !sessionId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!hasHydrated 
              ? "Chargement..." 
              : (!isAuthenticated || !user || !sessionId)
              ? "Redirection vers la page de connexion..."
              : "Vérification de l'authentification..."}
          </p>
        </div>
      </div>
    );
  }
  */

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </div>
          {/* Footer */}
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
