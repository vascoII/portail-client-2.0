"use client";
import React from "react";
import AdminFileInputExample from "./AdminFileInputExample";
import AdminRadioButtons from "./AdminRadioButtons";
import AdminCheckboxComponents from "./AdminCheckboxComponents";

export default function AdminParcCard() {
  

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Configuration Parc
        </h3>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <AdminFileInputExample />
            <AdminRadioButtons />
            <AdminCheckboxComponents />
          </div>
        </div>
      </div>
    </>
  );
}
