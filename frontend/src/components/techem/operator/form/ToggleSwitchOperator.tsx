"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Switch from "@/components/form/switch/Switch";

export default function ToggleSwitchOperator() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title="Liste immeubles partagés">
      <div className="flex gap-4">
        <Switch
          label=""
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
      </div>{" "}
    </ComponentCard>
  );
}
