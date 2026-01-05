"use client";
import React, { useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function UserMetaCard() {
  const { user, roles } = useAuth();

  // Extract user information
  const displayName = useMemo(() => {
    if (!user) return "—";
    // Try to construct full name from FirstName and UserName
    if (user.FirstName && user.UserName) {
      return `${user.FirstName} ${user.UserName}`;
    }
    // Fallback to UserName or LoginID
    return user.UserName || user.LoginID || "—";
  }, [user]);

  // Get role display name
  const roleDisplayName = useMemo(() => {
    if (!roles || roles.length === 0) return "—";
    
    // Map role codes to display names
    const roleMap: Record<string, string> = {
      ROLE_OCCUPANT: "Occupant",
      ROLE_GESTIONNAIRE: "Gestionnaire",
      ROLE_CLIENT: "Client",
    };

    // If the first role is ROLE_USER, use the second role instead
    const roleToDisplay = roles[0] === "ROLE_USER" && roles.length > 1 
      ? roles[1] 
      : roles[0];

    // Return the role's display name, or the role code if not mapped
    return roleMap[roleToDisplay] || roleToDisplay || "—";
  }, [roles]);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {displayName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {roleDisplayName}
                </p>
                {user?.Email || user?.EMail ? (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.Email || user.EMail}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
