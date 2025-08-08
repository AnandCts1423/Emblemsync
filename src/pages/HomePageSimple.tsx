import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import EHLogo from '../components/EmblemHealthLogo';

const HomePageSimple: React.FC = () => {
  const { colors } = useTheme();
  const { components, loading, error } = useData();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}10 100%)`,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center',
          maxWidth: '800px'
        }}
      >
        <EHLogo width={350} height={80} />
        
        <motion.h1 
          style={{ 
            fontSize: '3rem', 
            fontWeight: '700',
            color: colors.text,
            marginTop: '2rem',
            marginBottom: '1rem'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Component Tracker
        </motion.h1>

        <motion.p 
          style={{ 
            fontSize: '1.2rem',
            color: colors.textSecondary,
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Professional healthcare technology component management for EmblemHealth teams
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{
            background: colors.surface,
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.border}`
          }}
        >
          <h2 style={{ 
            color: colors.text, 
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            🎉 Backend Integration Status
          </h2>
          
          {loading ? (
            <div style={{ color: colors.textSecondary }}>
              Loading components from backend...
            </div>
          ) : error ? (
            <div style={{ color: colors.error }}>
              Error: {error}
            </div>
          ) : (
            <div>
              <div style={{ 
                color: colors.success, 
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                ✅ Backend Connected Successfully!
              </div>
              <div style={{ color: colors.text }}>
                Components loaded: <strong>{components.length}</strong>
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: colors.primary + '20',
              color: colors.primary,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              🏥 Healthcare Focus
            </div>
            <div style={{
              background: colors.secondary + '20',
              color: colors.secondary,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              🚀 Flask API
            </div>
            <div style={{
              background: colors.success + '20',
              color: colors.success,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              🎨 Theme Support
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePageSimple;
