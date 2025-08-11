import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Plus,
  Building2,
  User,
  Calendar,
  FileText,
  Hash,
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Component } from '../services/api';

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (component: Component) => void;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { colors } = useTheme();
  const { addComponent } = useData();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    componentId: '',
    name: '',
    version: '1.0.0',
    description: '',
    tower: 'Security',
    status: 'In Development',
    complexity: 'Medium',
    owner: '',
    releaseDate: ''
  });

  const towers = ['Security', 'Healthcare', 'Communication', 'Finance', 'Frontend'];
  const statuses = ['In Development', 'In Progress', 'Testing', 'Completed', 'Deployed'];
  const complexities = ['Simple', 'Medium', 'Complex'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const success = await addComponent(formData);
      
      if (success) {
        setNotification({
          type: 'success',
          message: `Component "${formData.name}" created successfully!`
        });
        
        // Call success callback
        onSuccess?.(formData as Component);
        
        // Reset form
        setFormData({
          componentId: '',
          name: '',
          version: '1.0.0',
          description: '',
          tower: 'Security',
          status: 'In Development',
          complexity: 'Medium',
          owner: '',
          releaseDate: ''
        });

        // Close modal after delay
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to create component. Please try again.'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error creating component. Please try again.'
      });
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setNotification(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass-container w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                  background: `${colors.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={20} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    margin: '0',
                    color: colors.text
                  }}>
                    Add New Component
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary, 
                    margin: '4px 0 0 0'
                  }}>
                    Create a new healthcare technology component
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: colors.textSecondary,
                  padding: '4px',
                  opacity: loading ? 0.5 : 1
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Component ID */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  <Hash size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Component ID
                </label>
                <input
                  type="text"
                  name="componentId"
                  value={formData.componentId}
                  onChange={handleInputChange}
                  placeholder="e.g., COMP-001"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              {/* Version */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  <Layers size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Version
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="1.0.0"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            {/* Component Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: colors.text 
              }}>
                <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Component Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter component name"
                className="input-field"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  background: colors.surface,
                  color: colors.text,
                  fontSize: '14px'
                }}
                required
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: colors.text 
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the component functionality..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  background: colors.surface,
                  color: colors.text,
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Tower */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  <Building2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Tower *
                </label>
                <select
                  name="tower"
                  value={formData.tower}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                  required
                >
                  {towers.map(tower => (
                    <option key={tower} value={tower}>{tower}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                  required
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Complexity */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  Complexity *
                </label>
                <select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                  required
                >
                  {complexities.map(complexity => (
                    <option key={complexity} value={complexity}>{complexity}</option>
                  ))}
                </select>
              </div>

              {/* Owner */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: colors.text 
                }}>
                  <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Owner
                </label>
                <input
                  type="text"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  placeholder="Team or person name"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: colors.surface,
                    color: colors.text,
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Release Date */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: colors.text 
              }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="input-field"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  background: colors.surface,
                  color: colors.text,
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Notification */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: notification.type === 'success' ? 
                      `${colors.success}15` : `${colors.error}15`,
                    border: `1px solid ${notification.type === 'success' ? colors.success : colors.error}30`,
                    color: notification.type === 'success' ? colors.success : colors.error
                  }}
                >
                  {notification.type === 'success' ? 
                    <CheckCircle size={16} /> : 
                    <AlertCircle size={16} />
                  }
                  {notification.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  background: colors.surface,
                  color: colors.text,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.componentId}
                className="btn btn-primary"
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (loading || !formData.name || !formData.componentId) ? 0.5 : 1,
                  cursor: (loading || !formData.name || !formData.componentId) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Save size={16} />
                  </motion.div>
                ) : (
                  <Save size={16} />
                )}
                {loading ? 'Creating...' : 'Create Component'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddComponentModal;
