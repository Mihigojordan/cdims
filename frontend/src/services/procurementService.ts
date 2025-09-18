import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api';

// Assuming these interfaces are defined elsewhere or import them
// For completeness, defining minimal versions here
export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  created_by: number;
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  created_at?: string;
  supplier?: Supplier;
  createdBy?: User;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: number;
  purchase_order_id?: number;
  material_id: number;
  unit_id: number;
  qty_ordered: number;
  unit_price: number;
  material?: Material;
  unit?: Unit;
}

export interface GoodsReceipt {
  id: number;
  purchase_order_id: number;
  store_id: number;
  received_by: number;
  received_at?: string;
  notes?: string;
  created_at?: string;
  purchaseOrder?: PurchaseOrder;
  store?: Store;
  receivedBy?: User;
  items?: GoodsReceiptItem[];
}

export interface GoodsReceiptItem {
  id?: number;
  goods_receipt_id?: number;
  material_id: number;
  unit_id: number;
  qty_received: number;
  unit_price: number;
  material?: Material;
  unit?: Unit;
}

export interface User {
  id: number;
  // Other fields as needed
}

export interface Material {
  id: number;
  // Other fields as needed
}

export interface Unit {
  id: number;
  // Other fields as needed
}

export interface Store {
  id: number;
  // Other fields as needed
}

// Input types
export type CreateSupplierInput = {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type CreatePurchaseOrderInput = {
  supplier_id: number;
  notes?: string;
  items: {
    material_id: number;
    unit_id: number;
    qty_ordered: number;
    unit_price: number;
  }[];
};

export type UpdatePurchaseOrderInput = {
  status?: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  items?: {
    material_id: number;
    unit_id: number;
    qty_ordered: number;
    unit_price: number;
  }[];
};

export type CreateGoodsReceiptInput = {
  purchase_order_id: number;
  store_id: number;
  notes?: string;
  items: {
    material_id: number;
    unit_id: number;
    qty_received: number;
    unit_price: number;
  }[];
};

// Pagination interface
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Filter params
interface PurchaseOrderFilterParams {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  supplier_id?: number;
}

interface GoodsReceiptFilterParams {
  page?: number;
  limit?: number;
  store_id?: number;
}

// Response types
interface SuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Procurement Service
 * Handles all procurement-related API calls including suppliers, purchase orders, and goods receipts
 */
class ProcurementService {
  private api: AxiosInstance = api;

  // =============== SUPPLIER METHODS ===============

  /**
   * Get all suppliers
   * @returns Array of suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { suppliers: Supplier[] } }> = 
        await this.api.get('/procurement/suppliers');
      return response.data.data.suppliers;
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch suppliers';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new supplier
   * @param supplierData - Supplier data
   * @returns Created supplier
   */
  async createSupplier(supplierData: CreateSupplierInput): Promise<Supplier> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { supplier: Supplier }; message: string }> = 
        await this.api.post('/procurement/suppliers', supplierData);
      return response.data.data.supplier;
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create supplier';
      throw new Error(errorMessage);
    }
  }

  // =============== PURCHASE ORDER METHODS ===============

  /**
   * Get all purchase orders with optional filtering
   * @param params - Query parameters for filtering
   * @returns Object containing purchase orders array and pagination info
   */
  async getPurchaseOrders(params?: PurchaseOrderFilterParams): Promise<{ purchaseOrders: PurchaseOrder[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id.toString());

      const response: AxiosResponse<{ success: boolean; data: { purchaseOrders: PurchaseOrder[]; pagination: Pagination } }> = 
        await this.api.get(`/procurement/purchase-orders?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch purchase orders';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new purchase order
   * @param purchaseOrderData - Purchase order data
   * @returns Created purchase order
   */
  async createPurchaseOrder(purchaseOrderData: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { purchaseOrder: PurchaseOrder }; message: string }> = 
        await this.api.post('/procurement/purchase-orders', purchaseOrderData);
      return response.data.data.purchaseOrder;
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create purchase order';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get purchase order by ID
   * @param id - Purchase order ID
   * @returns Purchase order or null if not found
   */
  async getPurchaseOrderById(id: number | string): Promise<PurchaseOrder | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { purchaseOrder: PurchaseOrder } }> = 
        await this.api.get(`/procurement/purchase-orders/${id}`);
      return response.data.data.purchaseOrder;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching purchase order by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch purchase order';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a purchase order
   * @param id - Purchase order ID
   * @param updateData - Data to update
   * @returns Updated purchase order
   */
  async updatePurchaseOrder(id: number | string, updateData: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { purchaseOrder: PurchaseOrder }; message: string }> = 
        await this.api.put(`/procurement/purchase-orders/${id}`, updateData);
      return response.data.data.purchaseOrder;
    } catch (error: any) {
      console.error('Error updating purchase order:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update purchase order';
      throw new Error(errorMessage);
    }
  }

  /**
   * Send a purchase order
   * @param id - Purchase order ID
   * @returns Success response
   */
  async sendPurchaseOrder(id: number | string): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = 
        await this.api.post(`/procurement/purchase-orders/${id}/send`);
      return response.data;
    } catch (error: any) {
      console.error('Error sending purchase order:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to send purchase order';
      throw new Error(errorMessage);
    }
  }

  // =============== GOODS RECEIPT METHODS ===============

  /**
   * Get all goods receipts with optional filtering
   * @param params - Query parameters for filtering
   * @returns Object containing goods receipts array and pagination info
   */
  async getGoodsReceipts(params?: GoodsReceiptFilterParams): Promise<{ goodsReceipts: GoodsReceipt[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());

      const response: AxiosResponse<{ success: boolean; data: { goodsReceipts: GoodsReceipt[]; pagination: Pagination } }> = 
        await this.api.get(`/procurement/goods-receipts?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching goods receipts:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch goods receipts';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new goods receipt
   * @param goodsReceiptData - Goods receipt data
   * @returns Created goods receipt
   */
  async createGoodsReceipt(goodsReceiptData: CreateGoodsReceiptInput): Promise<GoodsReceipt> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { goodsReceipt: GoodsReceipt }; message: string }> = 
        await this.api.post('/procurement/goods-receipts', goodsReceiptData);
      return response.data.data.goodsReceipt;
    } catch (error: any) {
      console.error('Error creating goods receipt:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create goods receipt';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get goods receipt by ID
   * @param id - Goods receipt ID
   * @returns Goods receipt or null if not found
   */
  async getGoodsReceiptById(id: number | string): Promise<GoodsReceipt | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { goodsReceipt: GoodsReceipt } }> = 
        await this.api.get(`/procurement/goods-receipts/${id}`);
      return response.data.data.goodsReceipt;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching goods receipt by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch goods receipt';
      throw new Error(errorMessage);
    }
  }

  // =============== VALIDATION METHODS ===============

  /**
   * Validate supplier data
   * @param data - Supplier data to validate
   * @returns Validation result
   */
  validateSupplierData(data: CreateSupplierInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.name?.trim()) {
      errors.push('Supplier name is required');
    }
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate purchase order data
   * @param data - Purchase order data to validate
   * @returns Validation result
   */
  validatePurchaseOrderData(data: CreatePurchaseOrderInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.supplier_id) {
      errors.push('Supplier ID is required');
    }
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    }
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate goods receipt data
   * @param data - Goods receipt data to validate
   * @returns Validation result
   */
  validateGoodsReceiptData(data: CreateGoodsReceiptInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.purchase_order_id) {
      errors.push('Purchase order ID is required');
    }
    if (!data.store_id) {
      errors.push('Store ID is required');
    }
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    }
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const procurementService = new ProcurementService();
export default procurementService;

// Named exports for individual methods
export const {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  sendPurchaseOrder,
  getGoodsReceipts,
  createGoodsReceipt,
  getGoodsReceiptById,
  validateSupplierData,
  validatePurchaseOrderData,
  validateGoodsReceiptData
} = procurementService;