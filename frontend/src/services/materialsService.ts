import api from '../api/api';

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
      unit: {
        id: number;
        name: string;
        symbol: string;
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
    [x: string]: any;
    requisitions(requisitions: any): unknown;
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

  getRequisitionById: async (id: string): Promise<MaterialRequisition> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.get<MaterialRequisition>(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch requisition');
    }
  },

  createRequisition: async (data: CreateRequisitionInput): Promise<MaterialRequisition> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: newRequisition } = await api.post<MaterialRequisition>('/requests', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return newRequisition;
    } catch (error: any) {
      console.error('Error creating requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to create requisition');
    }
  },

  updateRequisition: async (id: string, data: UpdateRequisitionInput): Promise<MaterialRequisition> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data: updatedRequisition } = await api.put<MaterialRequisition>(`/requests/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return updatedRequisition;
    } catch (error: any) {
      console.error('Error updating requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to update requisition');
    }
  },

  deleteRequisition: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      await api.delete(`/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      console.error('Error deleting requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete requisition');
    }
  },

  approveRequisition: async (id: string, action: 'APPROVED' | 'REJECTED', comment?: string): Promise<MaterialRequisition> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await api.post<MaterialRequisition>(`/requests/${id}/approve`, {
        action,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      console.error('Error approving requisition:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve requisition');
    }
  }
};

export default requisitionService;