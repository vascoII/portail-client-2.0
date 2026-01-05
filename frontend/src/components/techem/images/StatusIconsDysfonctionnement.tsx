import React from 'react';

interface StatusIconsDysfonctionnementProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function StatusIconsDysfonctionnement({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}: StatusIconsDysfonctionnementProps) {
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
      <path d="M3 3h18v4H3z"/>
      <path d="M3 17h18v4H3z"/>
      <path d="M3 7h18v10H3z"/>
      <path d="M8 12h8"/>
    </svg>
  );
}
