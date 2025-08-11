import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader,
  FileText,
  Database
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ProgressData {
  progress: number;
  total?: number;
  message?: string;
  timestamp: string;
}

interface LiveProgressIndicatorProps {
  show: boolean;
  onClose?: () => void;
  title?: string;
  className?: string;
}

const LiveProgressIndicator: React.FC<LiveProgressIndicatorProps> = ({
  show,
  onClose,
  title = "Processing...",
  className = ''
}) => {
  const { colors } = useTheme();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);

  // Listen for upload progress events
  useEffect(() => {
    const handleUploadProgress = (event: CustomEvent) => {
      const data = event.detail;
      setProgressData(data);
      setIsError(false);
    };

    const handleUploadComplete = (event: CustomEvent) => {
      const data = event.detail;
      setProgressData({
        progress: 100,
        message: `Upload complete! Created: ${data.created}, Updated: ${data.updated}`,
        timestamp: data.timestamp
      });
      setIsComplete(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose?.();
        setIsComplete(false);
        setProgressData(null);
      }, 3000);
    };

    const handleUploadError = () => {
      setIsError(true);
      setProgressData({
        progress: 0,
        message: "Upload failed. Please try again.",
        timestamp: new Date().toISOString()
      });
    };

    if (show) {
      window.addEventListener('upload_progress', handleUploadProgress as EventListener);
      window.addEventListener('upload_complete', handleUploadComplete as EventListener);
      window.addEventListener('upload_error', handleUploadError as EventListener);
    }

    return () => {
      window.removeEventListener('upload_progress', handleUploadProgress as EventListener);
      window.removeEventListener('upload_complete', handleUploadComplete as EventListener);
      window.removeEventListener('upload_error', handleUploadError as EventListener);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <AnimatePresence>
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
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`glass-container ${className}`}
          style={{
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '32px',
            minWidth: '400px',
            maxWidth: '500px',
            textAlign: 'center',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {onClose && !isComplete && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.textSecondary,
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          )}

          {/* Icon */}
          <div style={{ marginBottom: '24px' }}>
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle size={48} style={{ color: colors.success }} />
              </motion.div>
            ) : isError ? (
              <AlertCircle size={48} style={{ color: colors.error }} />
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Upload size={48} style={{ color: colors.primary }} />
              </motion.div>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: colors.text
          }}>
            {isComplete ? 'Upload Complete!' : 
             isError ? 'Upload Failed' : 
             title}
          </h3>

          {/* Progress Bar */}
          {progressData && !isError && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: `${colors.textSecondary}20`,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressData.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: isComplete ? 
                      `linear-gradient(90deg, ${colors.success}, ${colors.success}aa)` :
                      `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: '8px'
              }}>
                {progressData.progress}% {progressData.total && `(${progressData.progress}/${progressData.total})`}
              </div>
            </div>
          )}

          {/* Status Message */}
          {progressData?.message && (
            <div style={{
              fontSize: '14px',
              color: isError ? colors.error : colors.textSecondary,
              marginBottom: '20px',
              padding: '12px',
              borderRadius: '8px',
              background: isError ? 
                `${colors.error}10` : 
                isComplete ? `${colors.success}10` : `${colors.primary}10`,
              border: `1px solid ${isError ? colors.error : isComplete ? colors.success : colors.primary}20`
            }}>
              {progressData.message}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {isComplete && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="btn btn-primary"
                onClick={onClose}
                style={{ minWidth: '120px' }}
              >
                <CheckCircle size={18} style={{ marginRight: '8px' }} />
                Done
              </motion.button>
            )}

            {isError && (
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{ minWidth: '120px' }}
              >
                <AlertCircle size={18} style={{ marginRight: '8px' }} />
                Close
              </button>
            )}

            {!isComplete && !isError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: colors.textSecondary,
                fontSize: '14px'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader size={16} />
                </motion.div>
                Processing in real-time...
              </div>
            )}
          </div>

          {/* Live indicator */}
          {!isComplete && !isError && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
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
                fontSize: '12px',
                fontWeight: '600',
                color: colors.accent
              }}>
                LIVE
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveProgressIndicator;
