import React from 'react';

interface EmblemHealthLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const EmblemHealthLogo: React.FC<EmblemHealthLogoProps> = ({ 
  width = 200, 
  height = 50, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Logo Icon - Stylized leaf/emblem shape */}
        <g>
          {/* Purple segment */}
          <path
            d="M15 25 C15 15, 25 5, 40 5 C55 5, 65 15, 65 25 L65 50 C65 70, 50 85, 30 85 C20 85, 15 75, 15 65 L15 25 Z"
            fill="#6B46C1"
          />
          {/* Orange segment */}
          <path
            d="M65 25 C65 15, 75 5, 90 5 C105 5, 115 15, 115 25 L115 50 C115 70, 100 85, 80 85 C70 85, 65 75, 65 65 L65 25 Z"
            fill="#F59E0B"
          />
        </g>
        
        {/* Text: EmblemHealth */}
        <text
          x="140"
          y="35"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="32"
          fontWeight="700"
          fill="#6B46C1"
        >
          EmblemHealth
        </text>
        
        {/* Subtitle: Component Portal */}
        <text
          x="140"
          y="55"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="14"
          fontWeight="400"
          fill="#6B7280"
        >
          Component Portal
        </text>
        
        {/* Registered trademark */}
        <text
          x="370"
          y="25"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="12"
          fontWeight="400"
          fill="#6B46C1"
        >
          ®
        </text>
      </svg>
    </div>
  );
};

export default EmblemHealthLogo;
