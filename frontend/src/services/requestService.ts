import api from '../api/api';

// Define interfaces for the requisition data structure
export interface MaterialRequisition {
  id: number;
  site_id: number;
  requested_by: number;
  notes: string;
  status:  'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_PADIRI_REVEIW';
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

export interface ReceiveMaterialItem {
  request_item_id: number;
  qty_received: number;
}

export interface ReceiveMaterialsResponse {
  success: boolean;
  data: {
    request_id: number;
    received_items: {
      request_item_id: number;
      material_name: string;
      qty_received: number;
      total_received: number;
    }[];
    request_status: 'RECEIVED' | 'PARTIALLY_RECEIVED';
    all_items_received: boolean;
  };
}


export interface ModifyRequestItem {
  request_item_id?: number; // optional for new items
  material_id?: number;
  unit_id?: number;
  qty_requested?: number;
  qty_approved?: number;
}

export interface ModifyRequestInput {
  notes?: string;
  item_modifications?: ModifyRequestItem[];
  items_to_add?: ModifyRequestItem[];
  items_to_remove?: number[]; // request_item_id array
  modification_reason?: string;
}

export interface ModifyRequestResponse {
  success: boolean;
  data: {
    request: MaterialRequisition;
    modifications: {
      items_modified: number;
      items_added: number;
      items_removed: number;
      new_status: string;
    };
  };
}

export interface ApproveRequestItemModification {
  request_item_id: number;
  material_id?: number;
  unit_id?: number;
  qty_approved?: number;
  notes?: string;
}

export interface ApproveRequestPayload {
  level: 'DSE' | 'PADIRI' | 'ADMIN';
  comment: string;
  item_modifications?: ApproveRequestItemModification[];
  items_to_add?: ApproveRequestItemModification[];
  items_to_remove?: number[]; // request_item_id array
  modification_reason?: string;
}

export interface ApproveRequestResponse {
  success: boolean;
  data: {
    request: MaterialRequisition;
  };
  message: string;
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
approveRequisition:  async (
  requestId: string,
  level: 'DSE' | 'PADIRI' | 'ADMIN',
  comment: string,
  modifications?: {
    item_modifications?: ApproveRequestItemModification[];
    items_to_add?: ApproveRequestItemModification[];
    items_to_remove?: number[];
  }
): Promise<ApproveRequestResponse> => {
  if (!requestId) throw new Error('Request ID is required');
  if (!level) throw new Error('Approval level is required');
  if (!comment) throw new Error('Approval comment is required');

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication token not found');

    const payload: ApproveRequestPayload = {
      level,
      comment,
      ...modifications,
    };

    const { data } = await api.post<ApproveRequestResponse>(
      `/requests/${requestId}/approve`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!data?.success || !data?.data?.request) {
      throw new Error('Invalid response structure from server');
    }

    return data;
  } catch (error: any) {
    console.error('Error approving request:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve request');
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
      return updatedRequisition.data.request;
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

 receiveMaterials : async  (
  requestId: string,
  items: ReceiveMaterialItem[]
): Promise<ReceiveMaterialsResponse> => {
  if (!requestId) {
    throw new Error('Request ID is required');
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is required and cannot be empty');
  }

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const { data } = await api.post<ReceiveMaterialsResponse>(
      `/requests/${requestId}/receive`,
      { items },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!data?.success || !data?.data) {
      throw new Error('Invalid response structure from server');
    }

    return data;
  } catch (error: any) {
    console.error('Error receiving materials:', error);
    throw new Error(error.response?.data?.message || 'Failed to receive materials');
  }
},

// Close a requisition
closeRequisition: async (id: string, comment?: string): Promise<MaterialRequisition> => {
  if (!id) throw new Error('Requisition ID is required');

  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Authentication token not found');

  try {
    const { data } = await api.post<{ success: boolean; data: MaterialRequisition }>(
      `/requests/${id}/close`,
      { comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!data?.success || !data?.data) {
      throw new Error('Invalid response structure from server');
    }

    return data.data;
  } catch (error: any) {
    console.error('Error closing requisition:', error);
    throw new Error(error.response?.data?.message || 'Failed to close requisition');
  }
},

modifyRequest : async (
  requestId: string,
  payload: ModifyRequestInput
): Promise<ModifyRequestResponse> => {
  if (!requestId) {
    throw new Error('Request ID is required');
  }

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication token not found');

    const { data } = await api.put<ModifyRequestResponse>(
      `/requests/${requestId}/modify`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!data?.success || !data?.data) {
      throw new Error('Invalid response structure from server');
    }

    return data;
  } catch (error: any) {
    console.error('Error modifying request:', error);
    throw new Error(error.response?.data?.message || 'Failed to modify request');
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