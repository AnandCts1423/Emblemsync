import React from 'react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  
  // Use different logo based on theme
  const logoSrc = theme === 'dark' 
    ? '/emblemhealth-logo-white.svg' 
    : '/emblemhealth-logo.svg';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc}
        alt="EH Component Tracker - Powered by EmblemHealth" 
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default EHLogo;
