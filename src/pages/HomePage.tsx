import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  BarChart3, 
  Search, 
  TrendingUp, 
  Database, 
  Edit,
  ArrowRight,
  Zap,
  Shield,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HomePage: React.FC = () => {
  const { colors } = useTheme();

  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Upload Excel & JSON files with intelligent parsing and validation',
      path: '/upload',
      color: '#3b82f6'
    },
    {
      icon: BarChart3,
      title: 'Visual Dashboard',
      description: 'Interactive charts and cards showing component breakdowns',
      path: '/dashboard',
      color: '#8b5cf6'
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Powerful filtering by tower, complexity, and release dates',
      path: '/search',
      color: '#10b981'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Deep insights into component trends and performance',
      path: '/analytics',
      color: '#f59e0b'
    },
    {
      icon: Database,
      title: 'Full Data View',
      description: 'Complete component catalog with export capabilities',
      path: '/view-all',
      color: '#ef4444'
    },
    {
      icon: Edit,
      title: 'Live Updates',
      description: 'Add and modify components with real-time synchronization',
      path: '/update',
      color: '#06b6d4'
    }
  ];

  const stats = [
    { label: 'Components Managed', value: '10,000+', icon: Layers },
    { label: 'Active Towers', value: '25+', icon: Shield },
    { label: 'Release Speed', value: '3x Faster', icon: Zap }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        style={{
          textAlign: 'center',
          padding: '60px 0',
          marginBottom: '80px'
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            background: colors.gradient,
            borderRadius: '24px',
            padding: '16px',
            display: 'inline-block',
            marginBottom: '24px'
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Layers size={48} color="white" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="gradient-text"
          style={{
            fontSize: '4rem',
            fontWeight: '700',
            marginBottom: '24px'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          EmblemSight
        </motion.h1>

        <motion.p
          style={{
            fontSize: '1.5rem',
            color: colors.textSecondary,
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Professional Release & Component Summary Portal for visualizing, managing, and analyzing software components with stunning animations and insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Get Started
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                View Dashboard
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '80px'
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="glass-container"
            style={{
              textAlign: 'center',
              padding: '32px 24px'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 20px 40px ${colors.primary}20`
            }}
          >
            <motion.div
              style={{
                background: colors.gradient,
                borderRadius: '16px',
                padding: '16px',
                display: 'inline-block',
                marginBottom: '16px'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon size={32} color="white" />
            </motion.div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
              {stat.value}
            </h3>
            <p style={{ color: colors.textSecondary, fontSize: '16px' }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '80px' }}
      >
        <motion.h2
          style={{
            fontSize: '3rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '60px'
          }}
          variants={itemVariants}
        >
          Powerful Features
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { type: 'spring', stiffness: 300 }
              }}
              style={{ height: '100%' }}
            >
              <Link to={feature.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div 
                  className="card"
                  style={{
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <motion.div
                    style={{
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}80 100%)`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'inline-block',
                      marginBottom: '20px'
                    }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feature.icon size={28} color="white" />
                  </motion.div>

                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    color: colors.textSecondary,
                    lineHeight: '1.6',
                    marginBottom: '20px'
                  }}>
                    {feature.description}
                  </p>

                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: feature.color,
                      fontWeight: '600'
                    }}
                    whileHover={{ x: 8 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    Explore <ArrowRight size={16} />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="glass-container"
        style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
      >
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Ready to Transform Your Component Management?
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: colors.textSecondary,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Join thousands of developers who trust EmblemSight for professional component tracking and release management.
        </p>
        <Link 
          to="/upload" 
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '16px 32px' }}
        >
          Start Your Journey <Zap size={20} />
        </Link>
      </motion.section>
    </div>
  );
};

export default HomePage;
