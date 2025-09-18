import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import api from '../api/api'; // Adjust the import path as needed

// Interface for Store
export interface Store {
  id: number;
  code: string;
  name: string;
  location: string;
  description?: string;
  manager_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaces for input data
export type CreateStoreInput = Omit<Store, 'id' | 'created_at' | 'updated_at'>;
export type UpdateStoreInput = Partial<CreateStoreInput>;

// Interface for filtering
interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Interface for pagination response
interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Store Service
 * Handles all store-related API calls
 */
class StoreService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Get all stores with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Object containing stores array and pagination info
   */
  async getAllStores(params?: FilterParams): Promise<{ stores: Store[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<{ success: boolean; data: { stores: Store[]; pagination: Pagination } }> = 
        await this.api.get(`/stores?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stores';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get store by ID
   * @param id - Store ID
   * @returns Store or null if not found
   */
  async getStoreById(id: number | string): Promise<Store | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store }> = 
        await this.api.get(`/stores/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching store by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch store';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new store
   * @param storeData - Store data
   * @returns Created store
   */
  async createStore(storeData: CreateStoreInput): Promise<Store> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store; message: string }> = 
        await this.api.post('/stores', storeData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create store';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a store
   * @param id - Store ID
   * @param updateData - Data to update
   * @returns Updated store
   */
  async updateStore(id: number | string, updateData: UpdateStoreInput): Promise<Store> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store; message: string }> = 
        await this.api.put(`/stores/${id}`, updateData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update store';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a store
   * @param id - Store ID
   * @returns Response with success message
   */
  async deleteStore(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/stores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting store:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete store';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate store data
   * @param data - Store data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateStoreData(data: CreateStoreInput): ValidationResult {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push('Store name is required');
    }
    if (!data.location?.trim()) {
      errors.push('Store location is required');
    }
    if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
      errors.push('Invalid email format');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const storeService = new StoreService();
export default storeService;

// Named exports for individual methods
export const {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  validateStoreData,
} = storeService;