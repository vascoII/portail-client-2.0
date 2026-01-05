import React from 'react';

interface EquipementIconsRepartiteurProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function EquipementIconsRepartiteur({
  size = 20,
  className = 'text-gray-400',
  color = 'currentColor',
}: EquipementIconsRepartiteurProps) {
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
      <rect x="3" y="3" width="6" height="6" />
      <rect x="15" y="3" width="6" height="6" />
      <rect x="9" y="15" width="6" height="6" />
      <path d="M6 9v6" />
      <path d="M18 9v6" />
    </svg>
  );
}
