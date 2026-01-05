import React from 'react';

interface EquipementIconsCompteurProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function EquipementIconsCompteur({
  size = 20,
  className = 'text-gray-400',
  color = 'currentColor',
}: EquipementIconsCompteurProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12l4-4" />
      <path d="M12 12l-4 4" />
      <path d="M12 12v6" />
    </svg>
  );
}
