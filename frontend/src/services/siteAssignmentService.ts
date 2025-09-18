import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api';

// Interface for Site
export interface Site {
  id: number;
  name: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for User
export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for Role
export interface Role {
  id: number;
  name: string;
  description?: string;
}

// Interface for SiteAssignment
export interface SiteAssignment {
  id: number;
  site_id: number;
  user_id: number;
  assigned_by: number;
  assigned_at: string;
  status: 'ACTIVE' | 'INACTIVE';
  site?: Site;
  user?: User;
  assignedBy?: User;
}

// Interface for input data
export type CreateSiteAssignmentInput = {
  site_id: number;
  user_id: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type UpdateSiteAssignmentInput = {
  status?: 'ACTIVE' | 'INACTIVE';
};

// Interface for pagination
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Interface for filter parameters
interface FilterParams {
  page?: number;
  limit?: number;
  user_id?: number;
  site_id?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Interface for delete response
interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * SiteAssignment Service
 * Handles all site assignment-related API calls
 */
class SiteAssignmentService {
  private api: AxiosInstance = api;

  /**
   * Get all site assignments with optional filtering
   * @param params - Query parameters for filtering
   * @returns Object containing assignments array and pagination info
   */
  async getAllSiteAssignments(params?: FilterParams): Promise<{ assignments: SiteAssignment[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response: AxiosResponse<{ success: boolean; data: { assignments: SiteAssignment[]; pagination: Pagination } }> = 
        await this.api.get(`/site-assignments?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching site assignments:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch site assignments';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user's assigned sites (SITE_ENGINEER only)
   * @returns Array of assigned sites
   */
  async getUserAssignedSites(): Promise<Site[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Site[] }> = 
        await this.api.get('/site-assignments/my-sites');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching user assigned sites:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch assigned sites';
      throw new Error(errorMessage);
    }
  }

  /**
   * Assign a site to a user
   * @param assignmentData - Site assignment data
   * @returns Created site assignment
   */
  async assignSiteToUser(assignmentData: CreateSiteAssignmentInput): Promise<SiteAssignment> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: { assignment: SiteAssignment } }> = 
        await this.api.post('/site-assignments', assignmentData);
      return response.data.data.assignment;
    } catch (error: any) {
      console.error('Error assigning site to user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to assign site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a site assignment
   * @param id - Site assignment ID
   * @param updateData - Data to update
   * @returns Updated site assignment
   */
  async updateSiteAssignment(id: number | string, updateData: UpdateSiteAssignmentInput): Promise<SiteAssignment> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: { assignment: SiteAssignment } }> = 
        await this.api.put(`/site-assignments/${id}`, updateData);
      return response.data.data.assignment;
    } catch (error: any) {
      console.error('Error updating site assignment:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update site assignment';
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove a site assignment (soft delete)
   * @param id - Site assignment ID
   * @returns Response with success message
   */
  async removeSiteAssignment(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/site-assignments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing site assignment:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to remove site assignment';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate site assignment data
   * @param data - Site assignment data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateSiteAssignmentData(data: CreateSiteAssignmentInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.site_id) {
      errors.push('Site ID is required');
    }
    if (!data.user_id) {
      errors.push('User ID is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const siteAssignmentService = new SiteAssignmentService();
export default siteAssignmentService;

// Named exports for individual methods
export const {
  getAllSiteAssignments,
  getUserAssignedSites,
  assignSiteToUser,
  updateSiteAssignment,
  removeSiteAssignment,
  validateSiteAssignmentData
} = siteAssignmentService;