import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService, Component } from '../services/api';

interface DataContextType {
  components: Component[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addComponent: (component: Omit<Component, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<boolean>;
  updateComponent: (id: number, component: Partial<Component>) => Promise<boolean>;
  deleteComponent: (id: number) => Promise<boolean>;
  uploadFile: (file: File) => Promise<{ success: boolean; message: string; stats?: any }>;
  exportData: () => Promise<void>;
  searchComponents: (filters: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh data from API
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getComponents();
      if (response.success) {
        setComponents(response.components);
      } else {
        setError(response.error || 'Failed to load components');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new component
  const addComponent = useCallback(async (componentData: Omit<Component, 'id' | 'lastUpdated' | 'createdAt'>): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.createComponent(componentData);
      if (response.success && response.data) {
        setComponents(prev => [response.data!, ...prev]);
        return true;
      } else {
        setError(response.error || 'Failed to create component');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create component');
      return false;
    }
  }, []);

  // Update existing component
  const updateComponent = useCallback(async (id: number, componentData: Partial<Component>): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.updateComponent(id, componentData);
      if (response.success && response.data) {
        setComponents(prev => 
          prev.map(comp => comp.id === id ? response.data! : comp)
        );
        return true;
      } else {
        setError(response.error || 'Failed to update component');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update component');
      return false;
    }
  }, []);

  // Delete component
  const deleteComponent = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.deleteComponent(id);
      if (response.success) {
        setComponents(prev => prev.filter(comp => comp.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete component');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete component');
      return false;
    }
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file: File): Promise<{ success: boolean; message: string; stats?: any }> => {
    try {
      setError(null);
      const response = await apiService.uploadFile(file);
      if (response.success) {
        // Refresh data after upload
        await refreshData();
        return {
          success: true,
          message: response.message || 'File uploaded successfully',
          stats: {
            created: response.data?.created || 0,
            updated: response.data?.updated || 0,
            errors: response.data?.errors || []
          }
        };
      } else {
        setError(response.error || 'Upload failed');
        return {
          success: false,
          message: response.error || 'Upload failed'
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [refreshData]);

  // Export data
  const exportData = useCallback(async () => {
    try {
      const blob = await apiService.exportComponents();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eh-components-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  }, []);

  // Search components with filters
  const searchComponents = useCallback(async (filters: {
    search?: string;
    tower?: string;
    status?: string;
    complexity?: string;
    year?: string;
    month?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getComponents(filters);
      if (response.success) {
        setComponents(response.components);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value: DataContextType = {
    components,
    loading,
    error,
    refreshData,
    addComponent,
    updateComponent,
    deleteComponent,
    uploadFile,
    exportData,
    searchComponents
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
