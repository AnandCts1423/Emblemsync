import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  Zap,
  Bell,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, colors } = useTheme();
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const exportData = () => {
    // Mock export functionality
    const data = {
      settings: {
        theme,
        animationsEnabled,
        notificationsEnabled,
        autoRefresh,
        refreshInterval
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emblemsight-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetSettings = () => {
    setAnimationsEnabled(true);
    setNotificationsEnabled(true);
    setAutoRefresh(true);
    setRefreshInterval(30);
    setShowResetConfirm(false);
    // Theme is handled by context
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          title: 'Theme',
          description: 'Choose your preferred color scheme',
          component: (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={theme === 'dark' ? toggleTheme : undefined}
                style={{ padding: '8px 16px' }}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={theme === 'light' ? toggleTheme : undefined}
                style={{ padding: '8px 16px' }}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          )
        },
        {
          title: 'Animations',
          description: 'Enable smooth transitions and micro-interactions',
          component: (
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>
                {animationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          )
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          title: 'Push Notifications',
          description: 'Receive alerts for component updates and releases',
          component: (
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          )
        }
      ]
    },
    {
      title: 'Performance',
      icon: Zap,
      settings: [
        {
          title: 'Auto Refresh',
          description: 'Automatically refresh data at regular intervals',
          component: (
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>
                {autoRefresh ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          )
        },
        {
          title: 'Refresh Interval',
          description: 'How often to refresh data (in seconds)',
          component: (
            <select
              className="input"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              style={{ width: '120px', padding: '8px 12px' }}
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={300}>5min</option>
            </select>
          )
        }
      ]
    }
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="gradient-text" style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          marginBottom: '16px'
        }}>
          Settings
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: colors.textSecondary 
        }}>
          Customize your EmblemSight experience with personalized preferences and configurations.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              className="glass-container"
              style={{ padding: '32px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  background: colors.gradient,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <section.icon size={20} color="white" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {section.title}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {section.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.title}
                    style={{ 
                      padding: '20px',
                      backgroundColor: colors.surface,
                      borderRadius: '12px',
                      border: `1px solid ${colors.border}`
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (settingIndex * 0.05) }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: '20px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '600', 
                          marginBottom: '6px' 
                        }}>
                          {setting.title}
                        </h3>
                        <p style={{ 
                          fontSize: '14px', 
                          color: colors.textSecondary,
                          lineHeight: '1.4'
                        }}>
                          {setting.description}
                        </p>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {setting.component}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Quick Actions */}
          <div className="glass-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>
              Quick Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={exportData}
                style={{ justifyContent: 'flex-start' }}
              >
                <Download size={16} />
                Export Settings
              </button>
              
              <button 
                className={`btn ${showResetConfirm ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                style={{ justifyContent: 'flex-start' }}
              >
                <RefreshCw size={16} />
                Reset to Defaults
              </button>

              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '16px',
                    backgroundColor: `${colors.warning}10`,
                    border: `1px solid ${colors.warning}40`,
                    borderRadius: '8px'
                  }}
                >
                  <p style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary,
                    marginBottom: '12px' 
                  }}>
                    This will reset all settings to their default values. Are you sure?
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={resetSettings}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <CheckCircle size={14} />
                      Confirm
                    </button>
                    <button 
                      className="btn btn-ghost"
                      onClick={() => setShowResetConfirm(false)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="glass-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>
              System Information
            </h3>
            
            <div style={{ fontSize: '14px', color: colors.textSecondary }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`
              }}>
                <span>Version</span>
                <span style={{ fontWeight: '600' }}>1.0.0</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`
              }}>
                <span>Theme</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                  {theme}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`
              }}>
                <span>Browser</span>
                <span style={{ fontWeight: '600' }}>
                  {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <span>Last Updated</span>
                <span style={{ fontWeight: '600' }}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px' }}>
              About EmblemSight
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: colors.textSecondary,
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              Professional Release & Component Summary Portal for visualizing, managing, and analyzing software components with modern animations and insights.
            </p>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>
              Built with React, TypeScript, and Framer Motion
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
