import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Component } from '../types';

const UpdatePage: React.FC = () => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<Partial<Component>>({
    towerName: '',
    appGroup: '',
    componentType: '',
    changeType: 'Enhancement',
    complexity: 'Simple',
    status: 'Planned',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: ''
  });

  const towers = [
    'Digital Banking',
    'Customer Experience', 
    'Risk Management',
    'Payment Systems',
    'Infrastructure'
  ];

  const appGroups = [
    'Core Banking',
    'Mobile App',
    'Web Portal',
    'Fraud Detection',
    'Digital Wallet',
    'Card Management',
    'Investment Platform',
    'Onboarding',
    'Chatbot'
  ];

  const componentTypes = [
    'Frontend Module',
    'Backend Service',
    'API Gateway',
    'ML Model',
    'UI Component',
    'Data Pipeline',
    'Security Module',
    'Trading Engine',
    'Verification Service',
    'NLP Engine'
  ];

  const handleInputChange = (field: keyof Component, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.towerName) errors.push('Tower name is required');
    if (!formData.appGroup) errors.push('App group is required');
    if (!formData.componentType) errors.push('Component type is required');
    if (!formData.month || formData.month < 1 || formData.month > 12) errors.push('Valid month is required');
    if (!formData.year || formData.year < 2020 || formData.year > 2030) errors.push('Valid year is required');
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setSaving(true);
    setSaveStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success/error for demonstration
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        setSaveStatus('success');
        if (!isEditing) {
          // Reset form for new component
          setFormData({
            towerName: '',
            appGroup: '',
            componentType: '',
            changeType: 'Enhancement',
            complexity: 'Simple',
            status: 'Planned',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            description: ''
          });
        }
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      towerName: '',
      appGroup: '',
      componentType: '',
      changeType: 'Enhancement',
      complexity: 'Simple',
      status: 'Planned',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      description: ''
    });
    setIsEditing(false);
    setSaveStatus('idle');
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 className="gradient-text" style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          marginBottom: '16px'
        }}>
          {isEditing ? 'Update Component' : 'Add New Component'}
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: colors.textSecondary,
          marginBottom: '24px'
        }}>
          Create new components or modify existing ones with real-time validation and synchronization.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn ${!isEditing ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsEditing(false)}
          >
            <Plus size={20} />
            Add New
          </button>
          <button 
            className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsEditing(true)}
          >
            Edit Existing
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        {/* Form */}
        <motion.div
          className="glass-container"
          style={{ padding: '32px' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Basic Information */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Tower Name *
                  </label>
                  <select
                    className="input"
                    value={formData.towerName || ''}
                    onChange={(e) => handleInputChange('towerName', e.target.value)}
                  >
                    <option value="">Select Tower</option>
                    {towers.map(tower => (
                      <option key={tower} value={tower}>{tower}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    App Group *
                  </label>
                  <select
                    className="input"
                    value={formData.appGroup || ''}
                    onChange={(e) => handleInputChange('appGroup', e.target.value)}
                  >
                    <option value="">Select App Group</option>
                    {appGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Component Type *
                </label>
                <select
                  className="input"
                  value={formData.componentType || ''}
                  onChange={(e) => handleInputChange('componentType', e.target.value)}
                >
                  <option value="">Select Component Type</option>
                  {componentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Description
                </label>
                <textarea
                  className="input"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the component..."
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>
                Configuration
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Complexity
                  </label>
                  <select
                    className="input"
                    value={formData.complexity || 'Simple'}
                    onChange={(e) => handleInputChange('complexity', e.target.value as Component['complexity'])}
                  >
                    <option value="Simple">Simple</option>
                    <option value="Medium">Medium</option>
                    <option value="Complex">Complex</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Status
                  </label>
                  <select
                    className="input"
                    value={formData.status || 'Planned'}
                    onChange={(e) => handleInputChange('status', e.target.value as Component['status'])}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Development">In Development</option>
                    <option value="Released">Released</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Change Type
                  </label>
                  <select
                    className="input"
                    value={formData.changeType || 'Enhancement'}
                    onChange={(e) => handleInputChange('changeType', e.target.value)}
                  >
                    <option value="Enhancement">Enhancement</option>
                    <option value="New Feature">New Feature</option>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="Refactor">Refactor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Release Month *
                  </label>
                  <select
                    className="input"
                    value={formData.month || new Date().getMonth() + 1}
                    onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Release Year *
                  </label>
                  <select
                    className="input"
                    value={formData.year || new Date().getFullYear()}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = 2021 + i;
                      return (
                        <option key={year} value={year}>{year}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={20} className={saving ? 'animate-spin' : ''} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditing ? 'Update Component' : 'Create Component'}
                  </>
                )}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const previewData = {
                    ...formData,
                    id: isEditing ? 'existing-id' : `new-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  console.log('Component Preview:', previewData);
                  alert(`Component Preview:\n\n${JSON.stringify(previewData, null, 2)}`);
                }}
                disabled={saving}
              >
                Preview Data
              </button>
              
              <button 
                className="btn btn-ghost"
                onClick={resetForm}
                disabled={saving}
              >
                Reset Form
              </button>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Status Panel */}
          {saveStatus !== 'idle' && (
            <motion.div
              className="glass-container"
              style={{ padding: '20px' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {saveStatus === 'success' ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={32} color={colors.success} style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: colors.success, marginBottom: '8px' }}>
                    Success!
                  </h4>
                  <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                    Component {isEditing ? 'updated' : 'created'} successfully.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <AlertTriangle size={32} color={colors.error} style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: colors.error, marginBottom: '8px' }}>
                    Error
                  </h4>
                  <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                    Failed to {isEditing ? 'update' : 'create'} component. Please try again.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Help Panel */}
          <div className="glass-container" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Quick Help
            </h4>
            <div style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                • All fields marked with * are required
              </p>
              <p style={{ marginBottom: '12px' }}>
                • Complexity affects resource allocation
              </p>
              <p style={{ marginBottom: '12px' }}>
                • Status tracks development progress
              </p>
              <p>
                • Components sync automatically with the database
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-container" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Recent Activity
            </h4>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>
              <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ fontWeight: '500' }}>Payment Gateway Update</div>
                <div>2 hours ago</div>
              </div>
              <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ fontWeight: '500' }}>New ML Model Added</div>
                <div>5 hours ago</div>
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>UI Component Released</div>
                <div>1 day ago</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UpdatePage;
