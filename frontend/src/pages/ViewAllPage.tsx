import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Component } from '../services/api';
import AddComponentModal from '../components/AddComponentModal';
import UploadResultsModal from '../components/UploadResultsModal';

interface UploadResults {
  success: boolean;
  fileName: string;
  data: any[];
  errors: string[];
  created?: number;
  updated?: number;
  message?: string;
}

type SortField = 'name' | 'tower' | 'owner' | 'complexity' | 'status' | 'releaseDate';
type SortDirection = 'asc' | 'desc';

const ViewAllPage: React.FC = () => {
  const { colors } = useTheme();
  const { components, loading, error, refreshData, deleteComponent, batchDeleteComponents, uploadFile, exportData } = useData();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadResultsModal, setShowUploadResultsModal] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Filter and sort components - Pure UI logic
  const filteredAndSortedComponents = React.useMemo(() => {
    let filtered = components.filter(component => {
      const matchesSearch = !searchTerm || 
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTower = !selectedTower || component.tower === selectedTower;
      const matchesStatus = !selectedStatus || component.status === selectedStatus;
      const matchesComplexity = !selectedComplexity || component.complexity === selectedComplexity;
      
      return matchesSearch && matchesTower && matchesStatus && matchesComplexity;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';
      
      switch (sortField) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'tower':
          aVal = a.tower || '';
          bVal = b.tower || '';
          break;
        case 'owner':
          aVal = a.owner || '';
          bVal = b.owner || '';
          break;
        case 'complexity':
          aVal = a.complexity || '';
          bVal = b.complexity || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'releaseDate':
          aVal = a.releaseDate || '';
          bVal = b.releaseDate || '';
          break;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [components, searchTerm, selectedTower, selectedStatus, selectedComplexity, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedComponents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComponents = filteredAndSortedComponents.slice(startIndex, startIndex + itemsPerPage);

  // Helper functions - Pure UI interactions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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
      setSelectedRows(new Set(paginatedComponents.map(c => String(c.id || ''))));
    }
  };

  const exportSelected = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Batch delete selected components
  const handleBatchDelete = async () => {
    if (selectedRows.size === 0) {
      alert('Please select components to delete.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedRows.size} selected components?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const componentIds = Array.from(selectedRows).map(id => parseInt(id)).filter(id => !isNaN(id));
        const result = await batchDeleteComponents(componentIds);
        
        if (result.success) {
          alert(`Successfully deleted ${result.deletedCount || selectedRows.size} components.`);
          setSelectedRows(new Set()); // Clear selection
          setCurrentPage(1); // Reset to first page
        } else {
          alert(`Failed to delete components: ${result.message}`);
        }
      } catch (error) {
        console.error('Batch delete failed:', error);
        alert('Error deleting components. Please try again.');
      }
    }
  };

  // Upload file handling - Simplified to just send to backend
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    
    try {
      const result = await uploadFile(file);
      
      if (result.success) {
        // Get the latest components to show in preview
        await refreshData();
        const latestComponents = components.slice(0, 5); // Show first 5 as preview
        
        setUploadResults({
          success: true,
          fileName: file.name,
          data: latestComponents.map((comp: Component) => ({
            componentType: comp.name,
            towerName: comp.tower || 'Unknown',
            appGroup: comp.owner || 'Unknown',
            status: comp.status,
            complexity: comp.complexity,
            year: comp.releaseDate ? new Date(comp.releaseDate).getFullYear() : new Date().getFullYear(),
            month: comp.releaseDate ? new Date(comp.releaseDate).getMonth() + 1 : new Date().getMonth() + 1,
            changeType: 'Enhancement',
            description: comp.description || ''
          })),
          errors: result.stats?.errors || [],
          created: result.stats?.created,
          updated: result.stats?.updated,
          message: `Successfully uploaded ${result.stats?.created || 0} components`
        });
        setShowUploadResultsModal(true);
        setCurrentPage(1);
      } else {
        setUploadResults({
          success: false,
          fileName: file.name,
          data: [],
          errors: [result.message || 'Upload failed']
        });
        setShowUploadResultsModal(true);
      }
    } catch (error) {
      setUploadResults({
        success: false,
        fileName: file.name,
        data: [],
        errors: [error instanceof Error ? error.message : 'Upload failed']
      });
      setShowUploadResultsModal(true);
    }
    
    setUploading(false);
  }, [uploadFile, refreshData, components]);

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
  }, [handleUpload]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  // Delete component handler
  const handleDeleteComponent = async (component: Component) => {
    const confirmMessage = `Are you sure you want to delete component "${component.name}"?\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const success = await deleteComponent(component.id!);
        if (success) {
          console.log(`Component "${component.name}" deleted successfully`);
        } else {
          alert('Failed to delete component. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete component:', error);
        alert('Error deleting component. Please try again.');
      }
    }
  };

  // Color helper functions
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return colors.success;
      case 'Complex': return colors.error;
      case 'Medium': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Released': return colors.success;
      case 'In Development': return colors.warning;
      case 'Planned': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  // Get unique values for filters
  const towers = Array.from(new Set(components.map(c => c.tower).filter(Boolean)));
  const statuses = Array.from(new Set(components.map(c => c.status).filter(Boolean)));
  const complexities = Array.from(new Set(components.map(c => c.complexity).filter(Boolean)));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: colors.text 
      }}>
        Loading components...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: colors.error 
      }}>
        Error loading components: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: colors.text,
          marginBottom: '8px'
        }}>
          All Components
        </h1>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '1rem'
        }}>
          Manage and view all healthcare technology components
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: colors.textSecondary
            }} 
          />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '14px'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Upload Button */}
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="btn btn-secondary"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Upload size={16} />
              Upload Data
            </label>
          </div>

          <button 
            className="btn btn-success"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Component
          </button>

          <button 
            className="btn btn-primary"
            onClick={exportSelected}
          >
            <Download size={16} />
            Export
          </button>

          {selectedRows.size > 0 && (
            <button 
              className="btn btn-error"
              onClick={handleBatchDelete}
              title={`Delete ${selectedRows.size} selected components`}
            >
              <Trash2 size={16} />
              Delete Selected ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <select
          value={selectedTower}
          onChange={(e) => setSelectedTower(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: '14px'
          }}
        >
          <option value="">All Towers</option>
          {towers.map(tower => (
            <option key={tower} value={tower}>{tower}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: '14px'
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={selectedComplexity}
          onChange={(e) => setSelectedComplexity(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: '14px'
          }}
        >
          <option value="">All Complexities</option>
          {complexities.map(complexity => (
            <option key={complexity} value={complexity}>{complexity}</option>
          ))}
        </select>
      </div>

      {/* Components Table */}
      <div style={{ 
        backgroundColor: colors.surface,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.surface }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedComponents.length && paginatedComponents.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {[
                { key: 'name' as SortField, label: 'Component' },
                { key: 'tower' as SortField, label: 'Tower' },
                { key: 'owner' as SortField, label: 'Owner' },
                { key: 'complexity' as SortField, label: 'Complexity' },
                { key: 'status' as SortField, label: 'Status' },
                { key: 'releaseDate' as SortField, label: 'Release Date' }
              ].map((column) => (
                <th 
                  key={column.key}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '16px', textAlign: 'left' }}
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
              <th style={{ width: '120px', padding: '16px', textAlign: 'left' }}>Actions</th>
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
                  backgroundColor: selectedRows.has(String(component.id || '')) ? `${colors.primary}10` : 'transparent',
                  borderBottom: `1px solid ${colors.border}`
                }}
              >
                <td style={{ padding: '16px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(String(component.id || ''))}
                    onChange={() => handleSelectRow(String(component.id || ''))}
                  />
                </td>
                <td style={{ fontWeight: '600', padding: '16px' }}>{component.name}</td>
                <td style={{ padding: '16px' }}>{component.tower || 'Unknown'}</td>
                <td style={{ padding: '16px' }}>{component.owner || 'Unassigned'}</td>
                <td style={{ padding: '16px' }}>
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
                <td style={{ padding: '16px' }}>
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
                <td style={{ padding: '16px', fontSize: '14px', color: colors.textSecondary }}>
                  {component.releaseDate ? new Date(component.releaseDate).toLocaleDateString() : 'No Date'}
                </td>
                <td style={{ padding: '16px' }}>
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
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="btn btn-ghost"
                      style={{ padding: '4px', color: colors.error }}
                      title="Delete Component"
                      onClick={() => handleDeleteComponent(component)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedComponents.length)} of {filteredAndSortedComponents.length} components
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
      </div>

      {/* Add Component Modal */}
      <AddComponentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          console.log('Component added successfully');
          setCurrentPage(1); // Reset to first page to show new data
        }}
      />

      {/* Upload Results Modal */}
      <UploadResultsModal
        isOpen={showUploadResultsModal}
        onClose={() => {
          setShowUploadResultsModal(false);
          setUploadResults(null);
        }}
        results={uploadResults}
        onSaveToDatabase={() => {
          // Already saved in backend, just refresh and redirect
          refreshData();
        }}
        onExportPreview={() => {
          if (uploadResults?.data) {
            const csvContent = uploadResults.data.map(comp => 
              `"${comp.componentType}","${comp.towerName}","${comp.appGroup}","${comp.complexity}","${comp.status}","${comp.description || ''}"`
            ).join('\n');
            const blob = new Blob([`Component,Tower,App Group,Complexity,Status,Description\n${csvContent}`], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `upload-preview-${uploadResults.fileName}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        }}
        onViewAllData={() => {
          // Already on ViewAll page, just close modal
        }}
      />

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {dragActive && (
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
              backgroundColor: 'rgba(107, 70, 193, 0.1)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                background: colors.surface,
                padding: '48px',
                borderRadius: '16px',
                border: `2px dashed ${colors.primary}`,
                textAlign: 'center'
              }}
            >
              <Upload size={48} color={colors.primary} style={{ marginBottom: '16px' }} />
              <h3 style={{ color: colors.text, marginBottom: '8px' }}>Drop files here to upload</h3>
              <p style={{ color: colors.textSecondary }}>Supports CSV, JSON, and Excel files</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewAllPage;
