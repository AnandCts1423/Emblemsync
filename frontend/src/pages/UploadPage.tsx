import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  X,
  FileSpreadsheet,
  FileCode,
  Database,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import UploadResultsModal from '../components/UploadResultsModal';

interface UploadData {
  towerName: string;
  appGroup: string;
  componentType: string;
  changeType: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  month: number;
  year: number;
  status: 'Released' | 'In Development' | 'Planned';
  description?: string;
}

interface UploadResults {
  success: boolean;
  fileName: string;
  data: UploadData[];
  errors: string[];
}

const UploadPage: React.FC = () => {
  const { colors } = useTheme();
  const { uploadFile, refreshData } = useData();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showUploadResultsModal, setShowUploadResultsModal] = useState(false);

  const downloadTemplate = (format: 'csv' | 'json' = 'csv') => {
    // Create sample template data
    const sampleData = [
      {
        'Tower Name': 'Digital Banking',
        'App Group': 'Core Banking',
        'Component Type': 'Frontend Module',
        'Complexity': 'Medium',
        'Status': 'Released',
        'Year': 2024,
        'Month': 12,
        'Change Type': 'Enhancement',
        'Description': 'Customer account management interface'
      },
      {
        'Tower Name': 'Payment Systems',
        'App Group': 'Digital Wallet',
        'Component Type': 'API Gateway',
        'Complexity': 'Complex',
        'Status': 'In Development',
        'Year': 2025,
        'Month': 1,
        'Change Type': 'New Feature',
        'Description': 'Real-time payment processing service'
      },
      {
        'Tower Name': 'Customer Experience',
        'App Group': 'Mobile App',
        'Component Type': 'UI Component',
        'Complexity': 'Simple',
        'Status': 'Planned',
        'Year': 2025,
        'Month': 2,
        'Change Type': 'Bug Fix',
        'Description': 'Navigation menu component'
      }
    ];
    
    if (format === 'json') {
      // Create JSON content
      const jsonContent = JSON.stringify(sampleData.map(item => ({
        towerName: item['Tower Name'],
        appGroup: item['App Group'],
        componentType: item['Component Type'],
        complexity: item.Complexity,
        status: item.Status,
        year: item.Year,
        month: item.Month,
        changeType: item['Change Type'],
        description: item.Description
      })), null, 2);
      
      // Create and download JSON file
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `emblemsight-template-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Create CSV content
      const headers = Object.keys(sampleData[0]);
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `emblemsight-template-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  // ✅ REMOVED: validateComponent - Now handled by backend

  // ✅ REMOVED: mapComplexity & mapStatus - Now handled by backend

  const processFile = async (file: File): Promise<UploadResults> => {
    return new Promise((resolve) => {
      const fileName = file.name;
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        Papa.parse(file, {
          complete: (result) => {
            const data: UploadData[] = [];
            const errors: string[] = [];
            
            result.data.slice(1).forEach((row: any, index) => {
              if (row.length > 1) {
                // Just extract raw data - let backend handle validation and mapping
                const component = {
                  towerName: row[0] || '',
                  appGroup: row[1] || '',
                  componentType: row[2] || '',
                  complexity: row[3] || 'Medium',  // Raw value
                  status: row[4] || 'Planned',     // Raw value
                  year: parseInt(row[5]) || new Date().getFullYear(),
                  month: parseInt(row[6]) || new Date().getMonth() + 1,
                  changeType: row[7] || 'Enhancement',
                  description: row[8] || ''
                };
                
                // Basic check for required fields only
                if (component.towerName && component.appGroup && component.componentType) {
                  data.push(component as UploadData);
                } else {
                  errors.push(`Row ${index + 2}: Missing required fields (Tower Name, App Group, Component Type)`);
                }
              }
            });
            
            resolve({
              success: data.length > 0, // Success if we have any valid data
              fileName,
              data,
              errors
            });
          },
          header: false,
          skipEmptyLines: true
        });
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const processedData: UploadData[] = [];
            const errors: string[] = [];
            
            // Skip header row and process data
            (jsonData as any[]).slice(1).forEach((row: any[], index) => {
              if (row.length > 0) {
                // Just extract raw data - let backend handle validation and mapping
                const component = {
                  towerName: row[0] || '',
                  appGroup: row[1] || '',
                  componentType: row[2] || '',
                  complexity: row[3] || 'Medium',  // Raw value
                  status: row[4] || 'Planned',     // Raw value
                  year: parseInt(row[5]) || new Date().getFullYear(),
                  month: parseInt(row[6]) || new Date().getMonth() + 1,
                  changeType: row[7] || 'Enhancement',
                  description: row[8] || ''
                };
                
                // Basic check for required fields only
                if (component.towerName && component.appGroup && component.componentType) {
                  processedData.push(component as UploadData);
                } else {
                  errors.push(`Row ${index + 2}: Missing required fields (Tower Name, App Group, Component Type)`);
                }
              }
            });
            
            resolve({
              success: processedData.length > 0,
              fileName,
              data: processedData,
              errors
            });
          } catch (error) {
            resolve({
              success: false,
              fileName,
              data: [],
              errors: [`Failed to parse Excel file: ${error}`]
            });
          }
        };
        reader.readAsBinaryString(file);
      } else if (fileType === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            const data: UploadData[] = [];
            const errors: string[] = [];
            
            // Handle both array of objects and single object
            const componentsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            componentsArray.forEach((item: any, index: number) => {
              // Just extract raw data - let backend handle validation and mapping
              const component = {
                towerName: item.towerName || item['Tower Name'] || item.tower_name || '',
                appGroup: item.appGroup || item['App Group'] || item.app_group || '',
                componentType: item.componentType || item['Component Type'] || item.component_type || '',
                complexity: item.complexity || item.Complexity || 'Medium',  // Raw value
                status: item.status || item.Status || 'Planned',            // Raw value
                year: parseInt(item.year || item.Year) || new Date().getFullYear(),
                month: parseInt(item.month || item.Month) || new Date().getMonth() + 1,
                changeType: item.changeType || item['Change Type'] || item.change_type || 'Enhancement',
                description: item.description || item.Description || ''
              };
              
              // Basic check for required fields only
              if (component.towerName && component.appGroup && component.componentType) {
                data.push(component as UploadData);
              } else {
                errors.push(`Item ${index + 1}: Missing required fields (Tower Name, App Group, Component Type)`);
              }
            });
            
            resolve({
              success: data.length > 0, // Success if we have any valid data
              fileName,
              data,
              errors
            });
          } catch (error) {
            resolve({
              success: false,
              fileName,
              data: [],
              errors: [`Failed to parse JSON file: ${error}`]
            });
          }
        };
        reader.readAsText(file);
      } else {
        resolve({
          success: false,
          fileName,
          data: [],
          errors: ['Unsupported file type. Please upload CSV, Excel, or JSON files.']
        });
      }
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploading(true);
      const result = await processFile(files[0]);
      setUploadResults(result);
      setShowUploadResultsModal(true);
      setUploading(false);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      const result = await processFile(files[0]);
      setUploadResults(result);
      setShowUploadResultsModal(true);
      setUploading(false);
    }
  };

  // Save uploaded data to database
  const saveToDatabase = async () => {
    if (!uploadResults || !uploadResults.success) return;
    
    setSaving(true);
    try {
      // Convert uploaded data to backend format and use the uploadFile from DataContext
      const file = new File([JSON.stringify(uploadResults.data)], 'upload.json', {
        type: 'application/json'
      });
      
      const result = await uploadFile(file);
      
      if (result.success) {
        // Show success notification
        setNotification({
          type: 'success', 
          message: `Successfully saved ${uploadResults.data.length} components to database!`
        });
        
        // Refresh data context
        await refreshData();
        
        // Redirect to ViewAll page after 2 seconds
        setTimeout(() => {
          navigate('/view-all');
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to save to database. Please try again.'
        });
      }
    } catch (error) {
      console.error('Save to database error:', error);
      setNotification({
        type: 'error',
        message: 'Error saving to database. Please try again.'
      });
    }
    setSaving(false);
  };

  // Export preview functionality
  const exportPreview = () => {
    if (!uploadResults || !uploadResults.success) return;
    
    const csvContent = [
      'Tower,Owner,Component,Complexity,Status,Description',
      ...uploadResults.data.map(component => 
        `"${component.towerName}","${component.appGroup}","${component.componentType}",${component.complexity},${component.status},"${component.description || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadResults.fileName}_preview.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setNotification({
      type: 'success',
      message: 'Preview exported successfully!'
    });
  };

  return (
    <div>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: notification.type === 'success' ? colors.success : colors.error,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '300px'
            }}
            onAnimationComplete={() => {
              if (notification) {
                setTimeout(() => setNotification(null), 3000);
              }
            }}
          >
            {notification.type === 'success' ? 
              <CheckCircle size={18} /> : 
              <AlertCircle size={18} />
            }
            {notification.message}
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                marginLeft: 'auto',
                padding: '0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
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
          Upload Components
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: colors.textSecondary,
          marginBottom: '32px' 
        }}>
          Upload Excel, JSON, or CSV files containing component information for analysis and management.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => downloadTemplate('csv')}
            className="btn btn-secondary"
          >
            <Download size={20} />
            Download CSV Template
          </button>
          <button 
            onClick={() => downloadTemplate('json')}
            className="btn btn-ghost"
          >
            <FileCode size={20} />
            Download JSON Template
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Upload Area */}
        <motion.div
          className="glass-container"
          style={{
            padding: '40px',
            textAlign: 'center',
            border: dragActive ? `2px dashed ${colors.primary}` : `2px dashed ${colors.border}`,
            backgroundColor: dragActive ? `${colors.primary}10` : 'transparent',
            transition: 'all 0.3s ease'
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ marginBottom: '16px' }}
              >
                <Upload size={48} color={colors.primary} />
              </motion.div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Processing file...</p>
            </motion.div>
          ) : (
            <>
              <Upload size={64} color={colors.primary} style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px' }}>
                Drop files here or click to upload
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>
                Supports Excel (.xlsx, .xls), CSV (.csv), and JSON (.json) files
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.csv,.json"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="btn btn-primary">
                Choose File
              </label>
            </>
          )}
        </motion.div>

        {/* File Info */}
        <motion.div
          className="glass-container"
          style={{ padding: '32px' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
            Supported File Types
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileSpreadsheet size={24} color={colors.success} />
              <div>
                <div style={{ fontWeight: '600' }}>Excel Files</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  .xlsx, .xls formats
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color={colors.primary} />
              <div>
                <div style={{ fontWeight: '600' }}>CSV Files</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  Comma-separated values
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileCode size={24} color={colors.accent} />
              <div>
                <div style={{ fontWeight: '600' }}>JSON Files</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  JavaScript Object Notation
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            backgroundColor: colors.surface, 
            borderRadius: '8px' 
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
              Required Columns:
            </h4>
            <ul style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, paddingLeft: '16px' }}>
              <li>Tower Name</li>
              <li>App Group</li>
              <li>Component Type</li>
              <li>Complexity (Simple/Medium/Complex)</li>
              <li>Status (Released/In Development/Planned)</li>
              <li>Year, Month</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {uploadResults && (
          <motion.div
            className="glass-container"
            style={{ padding: '32px', marginTop: '32px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              {uploadResults.success ? (
                <CheckCircle size={24} color={colors.success} />
              ) : (
                <AlertCircle size={24} color={colors.error} />
              )}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                  {uploadResults.success ? 'Upload Successful!' : 'Upload Issues Found'}
                </h3>
                <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {uploadResults.fileName}
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setUploadResults(null)}
                style={{ marginLeft: 'auto', padding: '8px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Data Preview */}
            {uploadResults.data.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
                  Data Preview ({uploadResults.data.length} components)
                </h4>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  background: colors.surface,
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {uploadResults.data.slice(0, 5).map((component, index) => (
                    <div key={index} style={{ 
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: index < 4 ? `1px solid ${colors.border}` : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600' }}>{component.componentType}</span>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary
                        }}>
                          {component.complexity}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                        {component.towerName} • {component.appGroup}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {uploadResults.errors.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: colors.error }}>
                  Issues Found ({uploadResults.errors.length})
                </h4>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  background: colors.surface,
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} style={{ 
                      fontSize: '14px', 
                      color: colors.error,
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {uploadResults.success && uploadResults.data.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={saveToDatabase}
                  disabled={saving}
                >
                  <Database size={18} />
                  {saving ? 'Saving...' : 'Save to Database'}
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={exportPreview}
                  disabled={saving}
                >
                  <Eye size={18} />
                  Export Preview
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Results Modal */}
      <UploadResultsModal
        isOpen={showUploadResultsModal}
        onClose={() => {
          setShowUploadResultsModal(false);
          setUploadResults(null);
        }}
        results={uploadResults}
        onSaveToDatabase={saveToDatabase}
        onExportPreview={exportPreview}
        onViewAllData={() => {
          navigate('/view-all');
        }}
      />
    </div>
  );
};

export default UploadPage;
