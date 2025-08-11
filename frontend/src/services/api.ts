/**
 * EH Component Tracker - API Service Layer
 * Handles all backend API communications
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface Component {
  id?: number;
  componentId: string;
  name: string;
  version: string;
  description: string;
  tower: string;
  status: string;
  complexity: string;
  owner: string;
  releaseDate?: string;
  lastUpdated?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ComponentsResponse {
  success: boolean;
  components: Component[];
  count: number;
  error?: string;
}

export interface AnalyticsData {
  totalComponents: number;
  statusDistribution: { [key: string]: number };
  complexityDistribution: { [key: string]: number };
  towerDistribution: { [key: string]: number };
  recentComponents: Component[];
  monthlyReleases: Array<{
    year: number;
    month: number;
    count: number;
  }>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all components with optional filtering
   */
  async getComponents(filters: {
    search?: string;
    tower?: string;
    status?: string;
    complexity?: string;
    year?: string;
    month?: string;
  } = {}): Promise<ComponentsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        queryParams.append(key, value.trim());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/components${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ComponentsResponse>(endpoint);
  }

  /**
   * Create a new component
   */
  async createComponent(componentData: Omit<Component, 'id' | 'lastUpdated' | 'createdAt'>): Promise<ApiResponse<Component>> {
    return this.makeRequest<ApiResponse<Component>>('/components', {
      method: 'POST',
      body: JSON.stringify(componentData),
    });
  }

  /**
   * Update an existing component
   */
  async updateComponent(id: number, componentData: Partial<Component>): Promise<ApiResponse<Component>> {
    return this.makeRequest<ApiResponse<Component>>(`/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(componentData),
    });
  }

  /**
   * Delete a component
   */
  async deleteComponent(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>(`/components/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete multiple components at once
   */
  async batchDeleteComponents(componentIds: number[]): Promise<ApiResponse<{
    deletedCount: number;
    deletedComponents: string[];
  }>> {
    return this.makeRequest<ApiResponse<{
      deletedCount: number;
      deletedComponents: string[];
    }>>('/components/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ componentIds }),
    });
  }

  /**
   * Upload file with component data
   */
  async uploadFile(file: File): Promise<ApiResponse<{
    created: number;
    updated: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.makeRequest<ApiResponse<AnalyticsData>>('/analytics');
  }

  /**
   * Export components to CSV
   */
  async exportComponents(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`);
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5000/');
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
