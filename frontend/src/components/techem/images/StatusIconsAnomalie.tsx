import React from 'react';

interface StatusIconsAnomalieProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function StatusIconsAnomalie({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}: StatusIconsAnomalieProps) {
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
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4"/>
      <path d="M12 16h.01"/>
    </svg>
  );
}
