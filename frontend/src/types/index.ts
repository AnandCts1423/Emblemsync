// Core component data types
export interface Component {
  id: string;
  towerName: string;
  appGroup: string;
  componentType: string;
  changeType: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  month: number;
  year: number;
  status: 'Released' | 'In Development' | 'Planned';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard summary data
export interface TowerSummary {
  towerName: string;
  simple: number;
  medium: number;
  complex: number;
  total: number;
}

// Upload file types
export interface UploadData {
  components: Component[];
  metadata: {
    fileName: string;
    uploadDate: string;
    totalRecords: number;
  };
}

// Filter types
export interface ComponentFilters {
  towerName?: string;
  appGroup?: string;
  complexity?: Component['complexity'][];
  status?: Component['status'][];
  yearRange?: {
    start: number;
    end: number;
  };
  monthRange?: {
    start: number;
    end: number;
  };
}

// Theme types
export type Theme = 'light' | 'dark';

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Export options
export type ExportFormat = 'csv' | 'json' | 'xlsx';
