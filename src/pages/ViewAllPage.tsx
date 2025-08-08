import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Download, 
  ArrowUpDown, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Plus,
  Edit,
  Save,
  X,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { mockComponents } from '../data/mockComponents';
import { Component } from '../types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

const ViewAllPage: React.FC = () => {
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Component>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  // Upload functionality state
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  
  // Add/Edit functionality state
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [formData, setFormData] = useState({
    towerName: '',
    appGroup: '',
    componentType: '',
    complexity: 'Medium' as 'Simple' | 'Medium' | 'Complex',
    status: 'Planned' as 'Released' | 'In Development' | 'Planned',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    changeType: 'Enhancement',
    description: ''
  });
  
  // Local components state (for real-time updates)
  const [localComponents, setLocalComponents] = useState<Component[]>(mockComponents);

  // Sorting logic
  const sortedComponents = useMemo(() => {
    return [...localComponents].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? result : -result;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const result = aVal - bVal;
        return sortDirection === 'asc' ? result : -result;
      }
      
      return 0;
    });
  }, [localComponents, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedComponents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComponents = sortedComponents.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Component) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedComponents.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedComponents.map(c => c.id)));
    }
  };

  const exportSelected = () => {
    const selectedComponents = localComponents.filter(c => selectedRows.has(c.id));
    const csv = [
      // Headers
      ['ID', 'Tower', 'App Group', 'Component Type', 'Complexity', 'Status', 'Year', 'Month', 'Description'].join(','),
      // Data
      ...selectedComponents.map(c => [
        c.id,
        c.towerName,
        c.appGroup,
        c.componentType,
        c.complexity,
        c.status,
        c.year,
        c.month,
        `"${c.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emblemsight-components-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Complexity mapping function
  const mapComplexity = (value: string): 'Simple' | 'Medium' | 'Complex' => {
    const normalized = value?.toLowerCase()?.trim();
    switch (normalized) {
      case 'low':
      case 'simple':
      case 'easy':
      case 'basic':
        return 'Simple';
      case 'high':
      case 'complex':
      case 'hard':
      case 'difficult':
      case 'advanced':
        return 'Complex';
      case 'medium':
      case 'moderate':
      case 'intermediate':
      case 'mid':
      default:
        return 'Medium';
    }
  };

  // Status mapping function
  const mapStatus = (value: string): 'Released' | 'In Development' | 'Planned' => {
    const normalized = value?.toLowerCase()?.trim();
    switch (normalized) {
      case 'released':
      case 'live':
      case 'production':
      case 'deployed':
      case 'complete':
      case 'done':
        return 'Released';
      case 'in development':
      case 'in-development':
      case 'development':
      case 'dev':
      case 'in progress':
      case 'in-progress':
      case 'active':
      case 'working':
        return 'In Development';
      case 'planned':
      case 'pending':
      case 'future':
      case 'scheduled':
      case 'upcoming':
      default:
        return 'Planned';
    }
  };

  // Upload file processing
  const processUploadFile = async (file: File): Promise<UploadResults> => {
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
                const rawComplexity = row[3] || 'Medium';
                const rawStatus = row[4] || 'Planned';
                
                const component = {
                  towerName: row[0] || '',
                  appGroup: row[1] || '',
                  componentType: row[2] || '',
                  complexity: mapComplexity(rawComplexity),
                  status: mapStatus(rawStatus),
                  year: parseInt(row[5]) || new Date().getFullYear(),
                  month: parseInt(row[6]) || new Date().getMonth() + 1,
                  changeType: row[7] || 'Enhancement',
                  description: row[8] || ''
                };
                
                if (!component.towerName || !component.appGroup || !component.componentType) {
                  errors.push(`Row ${index + 2}: Missing required fields`);
                } else {
                  data.push(component);
                }
              }
            });
            
            resolve({ success: errors.length === 0, fileName, data, errors });
          },
          header: false,
          skipEmptyLines: true
        });
      } else if (fileType === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            const data: UploadData[] = [];
            const errors: string[] = [];
            
            const componentsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            componentsArray.forEach((item: any, index: number) => {
              const rawComplexity = item.complexity || item.Complexity || 'Medium';
              const rawStatus = item.status || item.Status || 'Planned';
              
              const component = {
                towerName: item.towerName || item['Tower Name'] || item.tower_name || '',
                appGroup: item.appGroup || item['App Group'] || item.app_group || '',
                componentType: item.componentType || item['Component Type'] || item.component_type || '',
                complexity: mapComplexity(rawComplexity),
                status: mapStatus(rawStatus),
                year: parseInt(item.year || item.Year) || new Date().getFullYear(),
                month: parseInt(item.month || item.Month) || new Date().getMonth() + 1,
                changeType: item.changeType || item['Change Type'] || item.change_type || 'Enhancement',
                description: item.description || item.Description || ''
              };
              
              if (!component.towerName || !component.appGroup || !component.componentType) {
                errors.push(`Item ${index + 1}: Missing required fields`);
              } else {
                data.push(component);
              }
            });
            
            resolve({ success: errors.length === 0, fileName, data, errors });
          } catch (error) {
            resolve({ success: false, fileName, data: [], errors: [`Failed to parse JSON: ${error}`] });
          }
        };
        reader.readAsText(file);
      } else {
        resolve({ success: false, fileName, data: [], errors: ['Unsupported file type. Please upload CSV or JSON files.'] });
      }
    });
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    setUploading(true);
    const results = await processUploadFile(file);
    setUploadResults(results);
    
    if (results.success && results.data.length > 0) {
      // Add uploaded components to local state
      const newComponents = results.data.map(item => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        towerName: item.towerName,
        appGroup: item.appGroup,
        componentType: item.componentType,
        complexity: item.complexity,
        status: item.status,
        year: item.year,
        month: item.month,
        changeType: item.changeType,
        description: item.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Component));
      
      setLocalComponents(prev => [...newComponents, ...prev]);
      setCurrentPage(1); // Reset to first page to show new data
    }
    
    setUploading(false);
  };

  // Drag and drop handlers
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
      await handleUpload(files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  // Add/Edit component functions
  const openAddComponent = () => {
    setEditingComponent(null);
    setFormData({
      towerName: '',
      appGroup: '',
      componentType: '',
      complexity: 'Medium',
      status: 'Planned',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      changeType: 'Enhancement',
      description: ''
    });
    setShowAddEdit(true);
  };

  const openEditComponent = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      towerName: component.towerName,
      appGroup: component.appGroup,
      componentType: component.componentType,
      complexity: component.complexity,
      status: component.status,
      year: component.year,
      month: component.month,
      changeType: component.changeType,
      description: component.description || ''
    });
    setShowAddEdit(true);
  };

  const saveComponent = () => {
    if (editingComponent) {
      // Update existing component
      setLocalComponents(prev => prev.map(c => 
        c.id === editingComponent.id 
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Add new component
      const newComponent: Component = {
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLocalComponents(prev => [newComponent, ...prev]);
      setCurrentPage(1); // Reset to first page to show new data
    }
    
    setShowAddEdit(false);
    setEditingComponent(null);
  };

  const getComplexityColor = (complexity: Component['complexity']) => {
    switch (complexity) {
      case 'Simple': return colors.success;
      case 'Medium': return colors.warning;
      case 'Complex': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: Component['status']) => {
    switch (status) {
      case 'Released': return colors.success;
      case 'In Development': return colors.warning;
      case 'Planned': return colors.textSecondary;
      default: return colors.textSecondary;
    }
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
          All Components
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: colors.textSecondary 
        }}>
          Complete component catalog with advanced sorting, filtering, and export capabilities.
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="glass-container"
        style={{ 
          padding: '20px', 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Database size={20} color={colors.primary} />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            {localComponents.length} Total Components
          </span>
          {selectedRows.size > 0 && (
            <span style={{ 
              fontSize: '14px', 
              color: colors.textSecondary,
              padding: '4px 8px',
              backgroundColor: `${colors.primary}20`,
              borderRadius: '12px'
            }}>
              {selectedRows.size} selected
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
          >
            <Upload size={16} />
            Upload Data
          </button>
          
          <button 
            className="btn btn-success"
            onClick={openAddComponent}
          >
            <Plus size={16} />
            Add Component
          </button>
          
          <div style={{ height: '20px', width: '1px', backgroundColor: colors.border }} />
          
          <label style={{ fontSize: '14px', color: colors.textSecondary }}>
            Per page:
          </label>
          <select 
            className="input"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: '80px', padding: '8px 12px' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <button 
            className="btn btn-secondary"
            disabled={selectedRows.size === 0}
            onClick={exportSelected}
          >
            <Download size={16} />
            Export {selectedRows.size > 0 ? `(${selectedRows.size})` : 'All'}
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="glass-container"
        style={{ padding: 0, overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedComponents.length && paginatedComponents.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                {[
                  { key: 'towerName' as const, label: 'Tower' },
                  { key: 'appGroup' as const, label: 'App Group' },
                  { key: 'componentType' as const, label: 'Component' },
                  { key: 'complexity' as const, label: 'Complexity' },
                  { key: 'status' as const, label: 'Status' },
                  { key: 'year' as const, label: 'Year' },
                  { key: 'month' as const, label: 'Month' },
                  { key: 'updatedAt' as const, label: 'Updated' }
                ].map((column) => (
                  <th 
                    key={column.key}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {column.label}
                      <ArrowUpDown 
                        size={14} 
                        color={sortField === column.key ? colors.primary : colors.textSecondary}
                      />
                    </div>
                  </th>
                ))}
                <th style={{ width: '60px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedComponents.map((component, index) => (
                <motion.tr
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    backgroundColor: selectedRows.has(component.id) ? `${colors.primary}10` : 'transparent'
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(component.id)}
                      onChange={() => handleSelectRow(component.id)}
                    />
                  </td>
                  <td style={{ fontWeight: '600' }}>{component.towerName}</td>
                  <td>{component.appGroup}</td>
                  <td>{component.componentType}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getComplexityColor(component.complexity)}20`,
                      color: getComplexityColor(component.complexity)
                    }}>
                      {component.complexity}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getStatusColor(component.status)}20`,
                      color: getStatusColor(component.status)
                    }}>
                      {component.status}
                    </span>
                  </td>
                  <td>{component.year}</td>
                  <td>
                    {new Date(0, component.month - 1).toLocaleString('default', { month: 'short' })}
                  </td>
                  <td style={{ fontSize: '12px', color: colors.textSecondary }}>
                    {new Date(component.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        className="btn btn-ghost"
                        style={{ padding: '4px' }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-ghost"
                        style={{ padding: '4px' }}
                        title="Edit Component"
                        onClick={() => openEditComponent(component)}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '20px 24px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedComponents.length)} of {sortedComponents.length} components
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-ghost"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{ padding: '8px' }}
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              className="btn btn-ghost"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px' }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 12px' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{ padding: '8px 12px', minWidth: '40px' }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              className="btn btn-ghost"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px' }}
            >
              <ChevronRight size={16} />
            </button>
            <button 
              className="btn btn-ghost"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{ padding: '8px' }}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '90%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Upload Component Data</h2>
                <button className="btn btn-ghost" onClick={() => setShowUpload(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div
                className="glass-container"
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  border: dragActive ? `2px dashed ${colors.primary}` : `2px dashed ${colors.border}`,
                  backgroundColor: dragActive ? `${colors.primary}10` : 'transparent',
                  transition: 'all 0.3s ease'
                }}
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
                      id="modal-file-upload"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="modal-file-upload" className="btn btn-primary">
                      Choose File
                    </label>
                  </>
                )}
              </div>
              
              {uploadResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-container"
                  style={{ padding: '20px', marginTop: '20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {uploadResults.success ? (
                      <CheckCircle size={24} color={colors.success} />
                    ) : (
                      <AlertCircle size={24} color={colors.error} />
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        {uploadResults.success ? 'Upload Successful!' : 'Upload Issues Found'}
                      </h3>
                      <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                        {uploadResults.fileName} • {uploadResults.data.length} components processed
                      </p>
                    </div>
                  </div>
                  
                  {uploadResults.errors.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: colors.error }}>
                        Issues Found ({uploadResults.errors.length})
                      </h4>
                      <div style={{ 
                        maxHeight: '150px', 
                        overflowY: 'auto',
                        background: colors.surface,
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        {uploadResults.errors.map((error, index) => (
                          <div key={index} style={{ 
                            fontSize: '14px', 
                            color: colors.error,
                            marginBottom: '4px'
                          }}>
                            • {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadResults.success && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setShowUpload(false);
                        setUploadResults(null);
                      }}
                      style={{ marginTop: '16px' }}
                    >
                      Done
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddEdit && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEdit(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px', width: '90%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {editingComponent ? 'Edit Component' : 'Add New Component'}
                </h2>
                <button className="btn btn-ghost" onClick={() => setShowAddEdit(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Tower Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.towerName}
                      onChange={(e) => setFormData({...formData, towerName: e.target.value})}
                      placeholder="Enter tower name"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">App Group</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.appGroup}
                      onChange={(e) => setFormData({...formData, appGroup: e.target.value})}
                      placeholder="Enter app group"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Component Type</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.componentType}
                    onChange={(e) => setFormData({...formData, componentType: e.target.value})}
                    placeholder="Enter component type"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Complexity</label>
                    <select
                      className="input"
                      value={formData.complexity}
                      onChange={(e) => setFormData({...formData, complexity: e.target.value as any})}
                    >
                      <option value="Simple">Simple</option>
                      <option value="Medium">Medium</option>
                      <option value="Complex">Complex</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Development">In Development</option>
                      <option value="Released">Released</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                      min="2020"
                      max="2030"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Month</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: parseInt(e.target.value) || 1})}
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter component description"
                    rows={3}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setShowAddEdit(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={saveComponent}
                  disabled={!formData.towerName || !formData.appGroup || !formData.componentType}
                >
                  <Save size={16} />
                  {editingComponent ? 'Update Component' : 'Add Component'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewAllPage;
