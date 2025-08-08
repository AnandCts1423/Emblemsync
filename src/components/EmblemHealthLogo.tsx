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
      <img 
        src="/emblemhealth-logo.svg" 
        alt="EH Component Tracker - Powered by EmblemHealth" 
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default EHLogo;
