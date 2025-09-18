import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import api from '../api/api'; // Adjust the import path as needed
import type { Unit } from './stockService';
import type {  Material } from './materialsService';

// Interface for Request
export interface Request {
  id: number;
  site_id: number;
  requested_by: number;
  notes?: string;
  status: 'DRAFT' | 'DSE_REVIEW' | 'PADIRI_REVIEW' | 'APPROVED' | 'REJECTED' | 'ISSUED';
  created_at?: Date;
  updated_at?: Date;
  site?: Site;
  requestedBy?: User;
  items?: RequestItem[];
  approvals?: Approval[];
}

// Interface for RequestItem
export interface RequestItem {
  id: number;
  request_id: number;
  material_id: number;
  unit_id: number;
  qty_requested: number;
  qty_approved?: number;
  material?: Material;
  unit?: Unit;
}

// Interface for Site
export interface Site {
  id: number;
  name: string;
  location?: string;
  description?: string;
}

// Interface for User
export interface User {
  id: number;
  name: string;
  role?: Role;
}

// Interface for Role
export interface Role {
  id: number;
  name: string;
}

// Interface for Approval
export interface Approval {
  id: number;
  request_id: number;
  level: 'DSE' | 'PADIRI';
  reviewer_id: number;
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';
  comment?: string;
  reviewer?: User;
  created_at?: Date;
}

// Interface for Comment
export interface Comment {
  id: number;
  comment: string;
  user_id: number;
  user?: { name: string };
  created_at?: Date;
}

// Interface for Attachment
export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  user_id: number;
  created_at?: Date;
}

// Interfaces for input data
export type CreateRequestInput = {
  site_id: number;
  notes?: string;
  items: { material_id: number; unit_id: number; qty_requested: number }[];
};

export type UpdateRequestInput = {
  site_id?: number;
  notes?: string;
  items?: { id?: number; material_id: number; unit_id: number; qty_requested: number }[];
};

export type ModifyRequestInput = {
  notes?: string;
  item_modifications?: { request_item_id: number; qty_requested: number; qty_approved?: number }[];
};

export type ApproveRequestInput = {
  level: 'DSE' | 'PADIRI';
  comment?: string;
  item_modifications?: { request_item_id: number; qty_approved: number }[];
};

export type RejectRequestInput = {
  level: 'DSE' | 'PADIRI';
  reason: string;
  comment?: string;
};

export type CommentInput = {
  comment: string;
};

export type AttachmentInput = {
  file: File;
  description?: string;
};

// Interface for filtering
interface FilterParams {
  page?: number;
  limit?: number;
  status?: string;
  site_id?: number;
  requested_by?: number;
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
 * Request Service
 * Handles all material request-related API calls
 */
class RequestService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Get all requests with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Object containing requests array and pagination info
   */
  async getAllRequests(params?: FilterParams): Promise<{ requests: Request[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());
      if (params?.requested_by) queryParams.append('requested_by', params.requested_by.toString());

      const response: AxiosResponse<{ success: boolean; data: { requests: Request[]; pagination: Pagination } }> = 
        await this.api.get(`/requests?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch requests';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get requests for the current user (SITE_ENGINEER only)
   * @param params - Query parameters for filtering and pagination
   * @returns Object containing user's requests array and pagination info
   */
  async getMyRequests(params?: FilterParams): Promise<{ requests: Request[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response: AxiosResponse<{ success: boolean; data: { requests: Request[]; pagination: Pagination } }> = 
        await this.api.get(`/requests/my-requests?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching my requests:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch my requests';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get requests for a specific site
   * @param siteId - Site ID
   * @param params - Query parameters for filtering and pagination
   * @returns Object containing requests array and pagination info
   */
  async getRequestsBySite(siteId: number | string, params?: FilterParams): Promise<{ requests: Request[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response: AxiosResponse<{ success: boolean; data: { requests: Request[]; pagination: Pagination } }> = 
        await this.api.get(`/requests/site/${siteId}?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching requests by site:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch site requests';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get request by ID
   * @param id - Request ID
   * @returns Request or null if not found
   */
  async getRequestById(id: number | string): Promise<Request | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { request: Request } }> = 
        await this.api.get(`/requests/${id}`);
      return response.data.data.request;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching request by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get available sites for the current user
   * @returns Array of available sites
   */
  async getAvailableSites(): Promise<Site[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Site[] }> = 
        await this.api.get('/requests/available-sites');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching available sites:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch available sites';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new material request
   * @param requestData - Request data
   * @returns Created request
   */
  async createRequest(requestData: CreateRequestInput): Promise<Request> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { request: Request }; message: string }> = 
        await this.api.post('/requests', requestData);
      return response.data.data.request;
    } catch (error: any) {
      console.error('Error creating request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a request (SITE_ENGINEER only)
   * @param id - Request ID
   * @param updateData - Data to update
   * @returns Updated request
   */
  async updateRequest(id: number | string, updateData: UpdateRequestInput): Promise<Request> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { request: Request }; message: string }> = 
        await this.api.put(`/requests/${id}`, updateData);
      return response.data.data.request;
    } catch (error: any) {
      console.error('Error updating request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Modify a request (DIOCESAN_SITE_ENGINEER only)
   * @param id - Request ID
   * @param modifyData - Modification data
   * @returns Response with success message
   */
  async modifyRequest(id: number | string, modifyData: ModifyRequestInput): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.put(`/requests/${id}/modify`, modifyData);
      return response.data;
    } catch (error: any) {
      console.error('Error modifying request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to modify request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Submit a request
   * @param id - Request ID
   * @returns Response with success message
   */
  async submitRequest(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.put(`/requests/${id}/submit`);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to submit request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve a request (DIOCESAN_SITE_ENGINEER or PADIRI)
   * @param id - Request ID
   * @param approveData - Approval data
   * @returns Response with success message
   */
  async approveRequest(id: number | string, approveData: ApproveRequestInput): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.post(`/requests/${id}/approve`, approveData);
      return response.data;
    } catch (error: any) {
      console.error('Error approving request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to approve request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve a request for storekeeper (PADIRI only)
   * @param id - Request ID
   * @param comment - Approval comment
   * @returns Response with success message
   */
  async approveForStorekeeper(id: number | string, comment?: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.post(`/requests/${id}/approve-storekeeper`, { comment });
      return response.data;
    } catch (error: any) {
      console.error('Error approving request for storekeeper:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to approve request for storekeeper';
      throw new Error(errorMessage);
    }
  }

  /**
   * Reject a request (DIOCESAN_SITE_ENGINEER or PADIRI)
   * @param id - Request ID
   * @param rejectData - Rejection data
   * @returns Response with success message
   */
  async rejectRequest(id: number | string, rejectData: RejectRequestInput): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = 
        await this.api.post(`/requests/${id}/reject`, rejectData);
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to reject request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get request comments
   * @param id - Request ID
   * @returns Array of comments
   */
  async getRequestComments(id: number | string): Promise<Comment[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Comment[] }> = 
        await this.api.get(`/requests/${id}/comments`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching request comments:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch comments';
      throw new Error(errorMessage);
    }
  }

  /**
   * Add a comment to a request
   * @param id - Request ID
   * @param commentData - Comment data
   * @returns Created comment
   */
  async addComment(id: number | string, commentData: CommentInput): Promise<Comment> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { comment: Comment }; message: string }> = 
        await this.api.post(`/requests/${id}/comments`, commentData);
      return response.data.data.comment;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to add comment';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get request attachments
   * @param id - Request ID
   * @returns Array of attachments
   */
  async getRequestAttachments(id: number | string): Promise<Attachment[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Attachment[] }> = 
        await this.api.get(`/requests/${id}/attachments`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching request attachments:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch attachments';
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload an attachment to a request
   * @param id - Request ID
   * @param attachmentData - Attachment data
   * @returns Uploaded attachment
   */
  async uploadAttachment(id: number | string, attachmentData: AttachmentInput): Promise<Attachment> {
    try {
      const formData = new FormData();
      formData.append('file', attachmentData.file);
      if (attachmentData.description) {
        formData.append('description', attachmentData.description);
      }

      const response: AxiosResponse<{ success: boolean; data: { attachment: Attachment }; message: string }> = 
        await this.api.post(`/requests/${id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      return response.data.data.attachment;
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to upload attachment';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate request data
   * @param data - Request data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateRequestData(data: CreateRequestInput): ValidationResult {
    const errors: string[] = [];

    if (!data.site_id) {
      errors.push('Site ID is required');
    }
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      data.items.forEach((item, index) => {
        if (!item.material_id) {
          errors.push(`Item ${index + 1}: Material ID is required`);
        }
        if (!item.unit_id) {
          errors.push(`Item ${index + 1}: Unit ID is required`);
        }
        if (!item.qty_requested || item.qty_requested <= 0) {
          errors.push(`Item ${index + 1}: Valid quantity requested is required`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const requestService = new RequestService();
export default requestService;

// Named exports for individual methods
export const {
  getAllRequests,
  getMyRequests,
  getRequestsBySite,
  getRequestById,
  getAvailableSites,
  createRequest,
  updateRequest,
  modifyRequest,
  submitRequest,
  approveRequest,
  approveForStorekeeper,
  rejectRequest,
  getRequestComments,
  addComment,
  getRequestAttachments,
  uploadAttachment,
  validateRequestData,
} = requestService;