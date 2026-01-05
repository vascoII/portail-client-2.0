"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeaderLess from "@/layout/AppHeaderLess";
import AppHeader from "@/layout/AppHeader";
import AppSidebarLess from "@/layout/AppSidebarLess";
import AppSidebar from "@/layout/AppSidebar";
import AppFooterLess from "@/layout/AppFooterLess";
import AppFooter from "@/layout/AppFooter";
import Backdrop from "@/layout/Backdrop";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isLoginPage = pathname === "/login";
  const isResetPasswordPage = pathname === "/reset-password";
  const isReleveCompteursPage = pathname === "/releve-compteurs";
  const isLegalNoticesPage = pathname === "/legal-notices";
  const isPersonalDatasPage = pathname === "/personal-datas";

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // If login page or reset-password page, render without header and sidebar
  if (isLoginPage || isResetPasswordPage || isReleveCompteursPage) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
          {/* Footer */}
          <AppFooterLess />
        </div>
      </div>
    );
  }

  // If legal-notices page and authenticated, use AppSidebar and AppHeader
  if ((isLegalNoticesPage || isPersonalDatasPage)&& isAuthenticated) {
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

  // Default: use AppSidebarLess and AppHeaderLess (for non-authenticated or other pages)
  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebarLess />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeaderLess />
        {/* Page Content */}
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </div>
          {/* Footer */}
          <AppFooterLess />
        </div>
      </div>
    </div>
  );
}
