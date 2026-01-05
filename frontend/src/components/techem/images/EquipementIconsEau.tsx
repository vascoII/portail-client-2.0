import React from 'react';

interface EquipementIconsEauProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function EquipementIconsEau({
  size = 20,
  className = 'text-gray-400',
  color = 'currentColor',
}: EquipementIconsEauProps) {
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
      <path d="M12 2C12 2 8 8 8 12a4 4 0 0 0 8 0c0-4-4-10-4-10z" />
      <path d="M6 22h12" />
      <path d="M10 16h4" />
    </svg>
  );
}
