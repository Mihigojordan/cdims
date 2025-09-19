import api from '../api/api';

// Interfaces
export interface MaterialRequisition {
  id: number;
  site_id: number;
  requested_by: number;
  notes: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED';
  site: {
    id: number;
    code: string;
    name: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
  requestedBy: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: {
      id: number;
      name: string;
    };
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  items: Array<{
    id: number;
    material_id: number;
    unit_id: number;
    qty_requested: number;
    qty_approved: number;
    material: {
      id: number;
      name: string;
      description: string;
      code: string;
      specifications: string;
      unit_price: number;
      category: {
        id: number;
        name: string;
      };
      unit?: { // Made optional to prevent 'Cannot read properties of undefined (reading 'symbol')'
        id: number;
        name: string;
        symbol: string;
      };
      created_at: string;
      updated_at: string;
    };
  }>;
  approvals: Array<{
    id: number;
    level: 'DSE' | 'MANAGER' | 'DIRECTOR';
    action: 'APPROVED' | 'REJECTED' | 'PENDING';
    comment: string;
    reviewer: {
      id: number;
      full_name: string;
      email: string;
      phone: string;
      role: {
        id: number;
        name: string;
      };
      active: boolean;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateRequisitionInput {
  site_id: number;
  notes: string;
  items: Array<{
    material_id: number;
    unit_id: number;
    qty_requested: number;
  }>;
}

export interface UpdateRequisitionInput {
  site_id?: number;
  notes?: string;
  status?: MaterialRequisition['status'];
  items?: Array<{
    id?: number;
    material_id: number;
    unit_id: number;
    qty_requested: number;
    qty_approved?: number;
  }>;
}

export interface RequisitionResponse {
  success: boolean;
  data: {
    requests: MaterialRequisition[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

export interface ApproveInput {
  comments: string;
}

export interface RejectInput {
  reason: string;
  comments: string;
}

export interface CommentInput {
  comment: string;
}

export interface Comment {
  id: number;
  comment: string;
  user_id: number;
  user: { name: string };
  created_at: string;
}

export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Service
const requisitionService = {
    getAllRequisitions: async (): Promise<RequisitionResponse> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<RequisitionResponse>('/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching requisitions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requisitions');
    }
  },
      
  async getRequisitionById(id: string): Promise<MaterialRequisition> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.get<MaterialRequisition>(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Validate items for missing unit
      response.data.items.forEach(item => {
        if (!item.material.unit) {
          console.warn(`Missing unit for material ID ${item.material.id} in requisition ${id}`);
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching requisition:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch requisition'
      );
    }
  },

  async createRequisition(data: CreateRequisitionInput): Promise<MaterialRequisition> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.post<MaterialRequisition>('/requests', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating requisition:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create requisition'
      );
    }
  },

  async updateRequisition(id: string, data: UpdateRequisitionInput): Promise<MaterialRequisition> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.put<MaterialRequisition>(`/requests/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating requisition:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update requisition'
      );
    }
  },

  async deleteRequisition(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await api.delete(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error('Error deleting requisition:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete requisition'
      );
    }
  },

  async approveRequisition(id: string, action: 'APPROVED' | 'REJECTED', comment?: string): Promise<MaterialRequisition> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.post<MaterialRequisition>(
        `/requests/${id}/approve`,
        { action, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error approving requisition:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to approve requisition'
      );
    }
  },

  async getRequisitionByIdFetch(id: number): Promise<ApiResponse<{ request: MaterialRequisition }>> {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch requisition: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validate items for missing unit
      data.data.request.items.forEach((item: any) => {
        if (!item.material.unit) {
          console.warn(`Missing unit for material ID ${item.material.id} in requisition ${id}`);
        }
      });
      
      return data;
    } catch (error: any) {
      console.error('Error fetching requisition:', error);
      throw new Error(error.message || 'Failed to fetch requisition');
    }
  },

  async approveRequisitionFetch(id: number, input: ApproveInput): Promise<ApiResponse<{ request: MaterialRequisition }>> {
    try {
      const response = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Failed to approve requisition: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error approving requisition:', error);
      throw new Error(error.message || 'Failed to approve requisition');
    }
  },

  async approveStorekeeper(id: number, input: ApproveInput): Promise<ApiResponse<{ request: MaterialRequisition }>> {
    try {
      const response = await fetch(`/api/requests/${id}/approve-storekeeper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Failed to approve requisition for storekeeper: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error approving storekeeper requisition:', error);
      throw new Error(error.message || 'Failed to approve requisition for storekeeper');
    }
  },

  async rejectRequisition(id: number, input: RejectInput): Promise<ApiResponse<{ request: MaterialRequisition }>> {
    try {
      const response = await fetch(`/api/requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Failed to reject requisition: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error rejecting requisition:', error);
      throw new Error(error.message || 'Failed to reject requisition');
    }
  },

  async getComments(id: number): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await fetch(`/api/requests/${id}/comments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw new Error(error.message || 'Failed to fetch comments');
    }
  },

  async addComment(id: number, input: CommentInput): Promise<ApiResponse<Comment>> {
    try {
      const response = await fetch(`/api/requests/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw new Error(error.message || 'Failed to add comment');
    }
  },

  async uploadAttachment(id: number, input: FormData): Promise<ApiResponse<{ attachment: Attachment }>> {
    try {
      const response = await fetch(`/api/requests/${id}/attachments`, {
        method: 'POST',
        body: input,
      });
      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      throw new Error(error.message || 'Failed to upload attachment');
    }
  },

  async getAttachments(id: number): Promise<ApiResponse<Attachment[]>> {
    try {
      const response = await fetch(`/api/requests/${id}/attachments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch attachments: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error fetching attachments:', error);
      throw new Error(error.message || 'Failed to fetch attachments');
    }
  },
};

export default requisitionService;