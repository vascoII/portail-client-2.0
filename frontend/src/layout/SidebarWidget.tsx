import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-xl bg-[#e9ecef] px-4 py-5 text-center`}
    >
      <h3 className="mb-2 font-semibold text-[#1d1914] text-base">
        #1 Tailwind CSS Dashboard
      </h3>
      <p className="mb-4 text-[#1d1914] text-sm">
        Leading Tailwind CSS Admin Template with 400+ UI Component and Pages.
      </p>
      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-[#e20613] text-sm hover:bg-[#b4050f] transition-all duration-300"
      >
        Upgrade To Pro
      </a>
    </div>
  );
}
