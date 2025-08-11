import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RealTimeStatusProps {
  isConnected: boolean;
  userCount: number;
  className?: string;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ 
  isConnected, 
  userCount, 
  className = '' 
}) => {
  const { colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        borderRadius: '20px',
        background: isConnected ? 
          `linear-gradient(135deg, ${colors.success}20, ${colors.success}10)` : 
          `linear-gradient(135deg, ${colors.error}20, ${colors.error}10)`,
        border: `1px solid ${isConnected ? colors.success : colors.error}40`,
        fontSize: '13px',
        fontWeight: '500'
      }}
    >
      {/* Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isConnected ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Wifi size={14} style={{ color: colors.success }} />
            </motion.div>
            <span style={{ color: colors.success }}>Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={14} style={{ color: colors.error }} />
            <span style={{ color: colors.error }}>Disconnected</span>
          </>
        )}
      </div>

      {/* Separator */}
      {isConnected && (
        <div 
          style={{
            width: '1px',
            height: '16px',
            background: colors.border,
            opacity: 0.5
          }} 
        />
      )}

      {/* Active Users */}
      {isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14} style={{ color: colors.textSecondary }} />
          <span style={{ color: colors.textSecondary }}>
            {userCount} {userCount === 1 ? 'user' : 'users'} online
          </span>
        </div>
      )}

      {/* Live Indicator */}
      {isConnected && (
        <>
          <div 
            style={{
              width: '1px',
              height: '16px',
              background: colors.border,
              opacity: 0.5
            }} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: colors.accent
              }}
            />
            <span style={{ 
              color: colors.accent,
              fontSize: '12px',
              fontWeight: '600'
            }}>
              LIVE
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RealTimeStatus;
