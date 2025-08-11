import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  FileText,
  BarChart3,
  Download,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Component } from '../services/api';

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    success: boolean;
    data: any[];
    errors?: string[];
    created?: number;
    updated?: number;
    message?: string;
  } | null;
  onSaveToDatabase?: () => void;
  onExportPreview?: () => void;
  onViewAllData?: () => void;
}

const UploadResultsModal: React.FC<UploadResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  results,
  onSaveToDatabase,
  onExportPreview,
  onViewAllData
}) => {
  const { colors } = useTheme();

  if (!isOpen || !results) return null;

  const totalComponents = results.data?.length || 0;
  const hasErrors = results.errors && results.errors.length > 0;
  const isSuccess = results.success && totalComponents > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass-container w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '0'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px 24px 0 24px',
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: isSuccess ? `${colors.success}20` : `${colors.error}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSuccess ? (
                    <CheckCircle size={24} style={{ color: colors.success }} />
                  ) : (
                    <AlertTriangle size={24} style={{ color: colors.error }} />
                  )}
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    margin: '0',
                    color: colors.text
                  }}>
                    {isSuccess ? 'Upload Successful!' : 'Upload Issues Detected'}
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary, 
                    margin: '4px 0 0 0'
                  }}>
                    {isSuccess ? 
                      `Successfully processed ${totalComponents} components` :
                      'Please review the issues below'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px 24px' }}>
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: `${colors.primary}15`,
                  border: `1px solid ${colors.primary}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: `${colors.primary}20`
                }}>
                  <FileText size={20} style={{ color: colors.primary }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>
                    {totalComponents}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    Total Components
                  </div>
                </div>
              </motion.div>

              {results.created !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: `${colors.success}15`,
                    border: `1px solid ${colors.success}30`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: `${colors.success}20`
                  }}>
                    <TrendingUp size={20} style={{ color: colors.success }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>
                      {results.created}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                      Created
                    </div>
                  </div>
                </motion.div>
              )}

              {results.updated !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: `${colors.warning}15`,
                    border: `1px solid ${colors.warning}30`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: `${colors.warning}20`
                  }}>
                    <BarChart3 size={20} style={{ color: colors.warning }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: colors.warning }}>
                      {results.updated}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                      Updated
                    </div>
                  </div>
                </motion.div>
              )}

              {hasErrors && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: `${colors.error}15`,
                    border: `1px solid ${colors.error}30`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: `${colors.error}20`
                  }}>
                    <AlertTriangle size={20} style={{ color: colors.error }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: colors.error }}>
                      {results.errors!.length}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                      Errors
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Errors Section */}
            {hasErrors && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: `${colors.error}10`,
                  border: `1px solid ${colors.error}30`
                }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.error,
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  Issues Found
                </h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {results.errors!.map((error, index) => (
                    <div key={index} style={{
                      padding: '8px 12px',
                      background: colors.surface,
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: colors.text,
                      borderLeft: `3px solid ${colors.error}`
                    }}>
                      {error}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Data Preview */}
            {isSuccess && totalComponents > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Eye size={16} />
                  Data Preview ({Math.min(5, totalComponents)} of {totalComponents})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: colors.textSecondary }}>Component</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: colors.textSecondary }}>Tower</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: colors.textSecondary }}>App Group</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: colors.textSecondary }}>Status</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', color: colors.textSecondary }}>Complexity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.slice(0, 5).map((component, index) => (
                        <tr key={index} style={{ borderBottom: `1px solid ${colors.border}40` }}>
                          <td style={{ padding: '8px', fontSize: '14px', color: colors.text }}>{component.componentType || component.name || 'N/A'}</td>
                          <td style={{ padding: '8px', fontSize: '14px', color: colors.text }}>{component.towerName || component.tower || 'N/A'}</td>
                          <td style={{ padding: '8px', fontSize: '14px', color: colors.text }}>{component.appGroup || 'N/A'}</td>
                          <td style={{ padding: '8px', fontSize: '14px', color: colors.text }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              backgroundColor: component.status === 'Released' ? '#22c55e20' : 
                                               component.status === 'In Development' ? '#f59e0b20' : '#6b46c120',
                              color: component.status === 'Released' ? '#22c55e' : 
                                     component.status === 'In Development' ? '#f59e0b' : '#6b46c1'
                            }}>
                              {component.status || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '8px', fontSize: '14px', color: colors.text }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              backgroundColor: component.complexity === 'Simple' ? '#22c55e20' : 
                                               component.complexity === 'Complex' ? '#ef444420' : '#f59e0b20',
                              color: component.complexity === 'Simple' ? '#22c55e' : 
                                     component.complexity === 'Complex' ? '#ef4444' : '#f59e0b'
                            }}>
                              {component.complexity || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalComponents > 5 && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    ... and {totalComponents - 5} more components
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {isSuccess && onSaveToDatabase && (
                <button
                  onClick={() => {
                    onSaveToDatabase();
                    onClose();
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload size={16} />
                  Save to Database
                </button>
              )}

              {isSuccess && onExportPreview && (
                <button
                  onClick={() => {
                    onExportPreview();
                    onClose();
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  Export Preview
                </button>
              )}

              {onViewAllData && (
                <button
                  onClick={() => {
                    onViewAllData();
                    onClose();
                  }}
                  className="btn btn-outline"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: `1px solid ${colors.border}`,
                    background: 'transparent',
                    color: colors.text
                  }}
                >
                  <Eye size={16} />
                  View All Data
                </button>
              )}

              <button
                onClick={onClose}
                className="btn btn-ghost"
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'transparent',
                  color: colors.textSecondary
                }}
              >
                Close
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadResultsModal;
