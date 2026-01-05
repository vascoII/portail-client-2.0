"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/lib/hooks/useAuth";

const AppSidebarLess: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, isAuthenticated } = useAuth();

  // Determine the home link based on user type
  const homeLink = useMemo(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user?.UserType) {
      return "/login"; // Redirect to login for non-logged users
    }
    
    // If UserType is O (Occupant), redirect to /occupant
    if (user.UserType === "O") {
      return "/occupant";
    }
    
    // If UserType is C (Client) or G (Gestionnaire), redirect to /parc
    if (user.UserType === "C" || user.UserType === "G") {
      return "/parc";
    }
    
    // Default fallback
    return "/parc";
  }, [isAuthenticated, user?.UserType]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={homeLink}>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/techem/logo.svg"
                alt="Logo"
                width={200}
                height={140}
              />
              <Image
                className="hidden dark:block"
                src="/images/techem/logo-dark.svg"
                alt="Logo"
                width={200}
                height={140}
              />
            </>
          ) : (
            <Image
              src="/images/techem/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {/* Menu section removed */}
      </div>
    </aside>
  );
};

export default AppSidebarLess;
