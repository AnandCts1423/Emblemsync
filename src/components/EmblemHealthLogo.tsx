import React from 'react';
import { motion } from 'framer-motion';

interface EHLogoProps {
  width?: number;
  height?: number;
  className?: string;
  animated?: boolean;
  variant?: 'full' | 'compact';
}

const EHLogo: React.FC<EHLogoProps> = ({ 
  width = 280, 
  height = 60, 
  className = '',
  animated = true,
  variant = 'full'
}) => {
  const logoVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)'
    },
    hover: {
      scale: 1.02,
      filter: 'brightness(1.1) saturate(1.1)'
    }
  };

  const glowAnimation = {
    boxShadow: [
      '0 0 20px rgba(239, 175, 45, 0.3)',
      '0 0 40px rgba(82, 35, 128, 0.2)',
      '0 0 20px rgba(239, 175, 45, 0.3)'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  };

  return (
    <motion.div 
      className={`healthcare-logo-container ${className}`}
      variants={animated ? logoVariants : undefined}
      initial={animated ? 'initial' : undefined}
      animate={animated ? 'animate' : undefined}
      whileHover={animated ? 'hover' : undefined}
      transition={{
        duration: 0.8,
        ease: 'easeOut'
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative'
      }}
    >
      {/* Subtle glow effect */}
      {animated && (
        <motion.div
          className="logo-glow"
          animate={glowAnimation}
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '12px',
            opacity: 0.6,
            zIndex: -1
          }}
        />
      )}
      
      {/* Main logo */}
      <img 
        src="/emblemhealth-logo.svg" 
        alt="EH Component Tracker - Powered by EmblemHealth"
        width={width}
        height={height}
        style={{ 
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(82, 35, 128, 0.15))',
          maxWidth: '100%',
          height: 'auto'
        }}
        loading="eager"
      />
    </motion.div>
  );
};

export default EHLogo;
