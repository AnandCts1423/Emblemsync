import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Upload, 
  BarChart3, 
  Search, 
  TrendingUp, 
  Database, 
  Edit, 
  Settings, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import EmblemHealthLogo from '../EmblemHealthLogo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, colors } = useTheme();
  const location = useLocation();

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Upload, label: 'Upload Components' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/search', icon: Search, label: 'Smart Search' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/view-all', icon: Database, label: 'All Components' },
    { path: '/update', icon: Edit, label: 'Manage Data' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text
    }}>
      {/* Header */}
      <motion.header 
        className="glass-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '16px 24px',
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo and Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '8px' }}
            >
              <Menu size={20} />
            </button>
            
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none',
                color: colors.text 
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <EmblemHealthLogo width={280} height={60} />
              </motion.div>
            </Link>
          </div>

          {/* Theme Toggle */}
          <motion.button
            className="btn btn-ghost"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ padding: '8px' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.aside
        className="glass-container"
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        initial="closed"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          zIndex: 40,
          padding: '100px 0 24px 0',
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderBottom: 'none'
        }}
      >
        <nav style={{ padding: '0 24px' }}>
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? colors.primary : colors.textSecondary,
                    backgroundColor: isActive ? `${colors.primary}20` : 'transparent',
                    border: isActive ? `1px solid ${colors.primary}40` : '1px solid transparent',
                    margin: '4px 0',
                    transition: 'all 0.3s ease'
                  }}
                  className={isActive ? '' : 'nav-link-hover'}
                >
                  <item.icon size={20} />
                  <span style={{ fontWeight: isActive ? '600' : '400' }}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>

      {/* Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main style={{
        paddingTop: '100px',
        paddingLeft: sidebarOpen ? '300px' : '0',
        paddingRight: '24px',
        paddingBottom: '24px',
        minHeight: '100vh',
        transition: 'padding-left 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {children}
        </div>
      </main>

      {/* Custom CSS for nav hover effects */}
      <style>{`
        .nav-link-hover:hover {
          background-color: ${colors.surface} !important;
          color: ${colors.text} !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};

export default Layout;
