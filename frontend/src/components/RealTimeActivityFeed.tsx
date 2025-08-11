import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  User,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UserActivity {
  user_id: string;
  activity: string;
  details?: string;
  timestamp: string;
}

interface RealTimeActivityFeedProps {
  activities: UserActivity[];
  className?: string;
  maxItems?: number;
}

const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ 
  activities, 
  className = '',
  maxItems = 5
}) => {
  const { colors } = useTheme();

  const getActivityIcon = (activity: string) => {
    switch (activity.toLowerCase()) {
      case 'created_component':
      case 'create':
        return <Plus size={14} style={{ color: colors.success }} />;
      case 'updated_component':
      case 'update':
        return <Edit3 size={14} style={{ color: colors.warning }} />;
      case 'deleted_component':
      case 'delete':
        return <Trash2 size={14} style={{ color: colors.error }} />;
      case 'bulk_upload_completed':
      case 'upload':
        return <Upload size={14} style={{ color: colors.primary }} />;
      case 'connected':
        return <User size={14} style={{ color: colors.success }} />;
      case 'disconnected':
        return <User size={14} style={{ color: colors.textSecondary }} />;
      default:
        return <Activity size={14} style={{ color: colors.primary }} />;
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity.toLowerCase()) {
      case 'created_component':
      case 'create':
      case 'connected':
        return colors.success;
      case 'updated_component':
      case 'update':
        return colors.warning;
      case 'deleted_component':
      case 'delete':
        return colors.error;
      case 'bulk_upload_completed':
      case 'upload':
        return colors.primary;
      case 'disconnected':
        return colors.textSecondary;
      default:
        return colors.accent;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const displayActivities = activities.slice(-maxItems).reverse();

  return (
    <div 
      className={`${className}`}
      style={{
        background: colors.surface,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <Activity size={18} style={{ color: colors.primary }} />
        </motion.div>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          margin: 0,
          color: colors.text
        }}>
          Live Activity
        </h3>
        <div style={{
          fontSize: '12px',
          padding: '2px 8px',
          borderRadius: '10px',
          background: `${colors.accent}20`,
          color: colors.accent,
          fontWeight: '500'
        }}>
          LIVE
        </div>
      </div>

      {/* Activity List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {displayActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '24px',
                color: colors.textSecondary,
                fontSize: '14px'
              }}
            >
              No recent activity
            </motion.div>
          ) : (
            displayActivities.map((activity, index) => (
              <motion.div
                key={`${activity.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 500,
                  damping: 25
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  background: index === 0 ? `${getActivityColor(activity.activity)}10` : 'transparent',
                  border: index === 0 ? `1px solid ${getActivityColor(activity.activity)}20` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{
                  background: `${getActivityColor(activity.activity)}15`,
                  scale: 1.02,
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Activity Icon */}
                <div style={{
                  padding: '6px',
                  borderRadius: '6px',
                  background: `${getActivityColor(activity.activity)}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getActivityIcon(activity.activity)}
                </div>

                {/* Activity Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.text,
                    marginBottom: '2px'
                  }}>
                    {activity.details || activity.activity}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    <Clock size={12} />
                    {formatTimestamp(activity.timestamp)}
                    <span style={{ 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      background: `${getActivityColor(activity.activity)}20`,
                      color: getActivityColor(activity.activity),
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {activity.user_id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight 
                  size={14} 
                  style={{ 
                    color: colors.textSecondary,
                    opacity: 0.5
                  }} 
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {displayActivities.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            Showing last {displayActivities.length} activities
          </span>
        </div>
      )}
    </div>
  );
};

export default RealTimeActivityFeed;
