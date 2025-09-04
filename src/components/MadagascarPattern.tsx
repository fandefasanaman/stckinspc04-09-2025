import React from 'react';

const MadagascarPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
      <svg
        className="absolute top-4 right-4 w-32 h-40"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Contour simplifié de Madagascar */}
        <path
          d="M20 10 C25 8, 30 12, 35 15 L40 20 C45 25, 50 30, 55 35 L60 45 C65 55, 70 65, 75 75 L80 85 C82 95, 80 105, 75 110 L65 115 C55 118, 45 115, 35 110 L25 105 C15 100, 10 90, 12 80 L15 70 C18 60, 20 50, 22 40 L25 30 C22 25, 20 20, 20 10 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

export default MadagascarPattern;