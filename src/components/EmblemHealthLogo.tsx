import React from 'react';

interface EHLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const EHLogo: React.FC<EHLogoProps> = ({ 
  width = 280, 
  height = 60, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg width={width} height={height} viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M10 20 C10 10, 15 5, 25 5 C35 5, 50 10, 60 25 C65 35, 65 45, 60 55 C50 70, 35 75, 25 75 C15 75, 10 70, 10 60 L10 20 Z" fill="#663399"></path>
          <path d="M60 25 C70 10, 85 5, 95 5 C105 5, 110 10, 110 20 L110 60 C110 70, 105 75, 95 75 C85 75, 70 70, 60 55 C55 45, 55 35, 60 25 Z" fill="#FF9900"></path>
        </g>
        <text x="140" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700" fill="#663399">EH Component Tracker</text>
        <text x="140" y="55" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="400" fill="#666666">Powered by EmblemHealth</text>
        <text x="385" y="30" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="400" fill="#663399">®</text>
      </svg>
    </div>
  );
};

export default EHLogo;
