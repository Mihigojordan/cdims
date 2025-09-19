import api from '../api/api';

// Define interfaces for the requisition data structure
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
  items: {
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
      unit?: {
        // Made unit optional to handle cases where it might be missing
        id: number;
        name: string;
        symbol?: string; // Made symbol optional to prevent undefined errors
      };
      created_at: string;
      updated_at: string;
    };
  }[];
  approvals: {
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
  }[];
  created_at: string;
  updated_at: string;
}

export interface CreateRequisitionInput {
  site_id: number;
  notes: string;
  items: {
    material_id: number;
    unit_id: number;
    qty_requested: number;
  }[];
}

export interface UpdateRequisitionInput {
  site_id?: number;
  notes?: string;
  status?: MaterialRequisition['status'];
  items?: {
    id?: number;
    material_id: number;
    unit_id: number;
    qty_requested: number;
    qty_approved?: number;
  }[];
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

const requisitionService = {
  // Fetch all requisitions with pagination
  getAllRequisitions: async (): Promise<RequisitionResponse> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data } = await api.get<RequisitionResponse>('/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Validate response structure
      if (!data?.success || !data?.data?.requests) {
        throw new Error('Invalid response structure');
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching requisitions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requisitions');
    }
  },

    getAllMyRequisitions: async (): Promise<RequisitionResponse> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data } = await api.get<RequisitionResponse>('/requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Validate response structure
      if (!data?.success || !data?.data?.requests) {
        throw new Error('Invalid response structure');
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching requisitions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requisitions');
    }
  },


  // Fetch a single requisition by ID
  getRequisitionById: async (id: string): Promise<MaterialRequisition> => {
    if (!id) {
      throw new Error('Requisition ID is required');
    }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data } = await api.get<MaterialRequisition>(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Validate that the material unit exists to prevent undefined errors
      data.items?.forEach((item) => {
        if (!item.material.unit) {
          console.warn(`Missing unit for material ID ${item.material_id}`);
          item.material.unit = { id: item.unit_id, name: 'Unknown', symbol: '' };
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requisition');
    }
  },
// Approve a requisition
approveRequisition: async (
  id: string,
  level: 'DSE' | 'PADIRI',
  comment: string,
  item_modifications?: { request_item_id: number; qty_approved: number }[]
): Promise<MaterialRequisition> => {
  if (!id) {
    throw new Error('Requisition ID is required');
  }

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const payload: {
      level: string;
      comment: string;
      item_modifications?: { request_item_id: number; qty_approved: number }[];
    } = { level, comment };

    if (item_modifications) {
      payload.item_modifications = item_modifications;
    }

    const { data } = await api.post<{ success: boolean; data: { request: MaterialRequisition } }>(
      `/requests/${id}/approve`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data.data.request;
  } catch (error: any) {
    console.error('Error approving requisition:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve requisition');
  }
},

  // Create a new requisition
  createRequisition: async (data: CreateRequisitionInput): Promise<MaterialRequisition> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data: newRequisition } = await api.post<MaterialRequisition>('/requests', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return newRequisition.data.request;
    } catch (error: any) {
      console.error('Error creating requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to create requisition');
    }
  },

  // Update an existing requisition
  updateRequisition: async (id: string, data: UpdateRequisitionInput): Promise<MaterialRequisition> => {
    if (!id) {
      throw new Error('Requisition ID is required');
    }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      const { data: updatedRequisition } = await api.put<MaterialRequisition>(`/requests/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return updatedRequisition;
    } catch (error: any) {
      console.error('Error updating requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to update requisition');
    }
  },
  

  // Reject a requisition
rejectRequisition: async (
  id: string,
  level: string,
  reason: string,
  comment?: string
): Promise<MaterialRequisition> => {
  if (!id) {
    throw new Error('Requisition ID is required');
  }
  if (!reason) {
    throw new Error('Rejection reason is required');
  }

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const { data } = await api.post<{
      success: boolean;
      data: { request: MaterialRequisition };
    }>(
      `/requests/${id}/reject`,
      { level, reason, comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!data?.success || !data?.data?.request) {
      throw new Error('Invalid response structure from server');
    }

    return data.data.request;
  } catch (error: any) {
    console.error('Error rejecting requisition:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject requisition');
  }
},


  // Delete a requisition
  deleteRequisition: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('Requisition ID is required');
    }
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
      throw new Error(error.response?.data?.message || 'Failed to delete requisition');
    }
  },


};

export default requisitionService;