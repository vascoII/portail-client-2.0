import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mon Profile | TECHEM - Espace client",
  description: "Profile utilisateur",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-xl border border-[#1d1914] bg-white p-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-6">
        <h3 className="mb-5 text-xl font-normal text-[#1d1914] lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
        </div>
      </div>
    </div>
  );
}
