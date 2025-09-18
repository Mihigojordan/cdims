import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import api from '../api/api'; // Adjust the import path as needed

// Interface for Site
export interface Site {
  id: number;
  code?: string;
  name: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaces for input data
export type CreateSiteInput = Omit<Site, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSiteInput = Partial<CreateSiteInput>;

// Interface for pagination
interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Interface for filter parameters
interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
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
 * Site Service
 * Handles all site-related API calls
 */
class SiteService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Get all sites with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Array of sites with pagination info
   */
  async getAllSites(params?: FilterParams): Promise<{ sites: Site[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<{ success: boolean; data: { sites: Site[]; pagination: Pagination } }> =
        await this.api.get(`/sites?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching sites:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch sites';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get site by ID
   * @param id - Site ID
   * @returns Site or null if not found
   */
  async getSiteById(id: number | string): Promise<Site | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { site: Site } }> =
        await this.api.get(`/sites/${id}`);
      return response.data.data.site;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching site by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new site
   * @param siteData - Site data
   * @returns Created site
   */
  async createSite(siteData: CreateSiteInput): Promise<Site> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { site: Site }; message: string }> =
        await this.api.post('/sites', siteData);
      return response.data.data.site;
    } catch (error: any) {
      console.error('Error creating site:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a site
   * @param id - Site ID
   * @param updateData - Data to update
   * @returns Updated site
   */
  async updateSite(id: number | string, updateData: UpdateSiteInput): Promise<Site> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { site: Site }; message: string }> =
        await this.api.put(`/sites/${id}`, updateData);
      return response.data.data.site;
    } catch (error: any) {
      console.error('Error updating site:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a site
   * @param id - Site ID
   * @returns Response with success message
   */
  async deleteSite(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/sites/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting site:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate site data
   * @param data - Site data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateSiteData(data: CreateSiteInput): ValidationResult {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Site name is required');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const siteService = new SiteService();
export default siteService;

// Named exports for individual methods
export const {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  validateSiteData,
} = siteService;