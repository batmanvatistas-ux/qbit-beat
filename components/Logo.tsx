
import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="24" height="24" rx="6" fill="black" />
    <circle cx="8" cy="16" r="2" fill="white" />
    <rect x="14" y="6" width="4" height="4" rx="1" fill="white" />
    <rect x="14" y="14" width="4" height="4" rx="1" fill="white" />
  </svg>
);
