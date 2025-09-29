import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // Adjust the import path as needed

// Interface for Stock
export interface Stock {
  id: number;
  material_id: number;
  store_id: number;
  qty_on_hand: number;
  reorder_level?: number;
  low_stock_threshold?: number;
  low_stock_alert?: boolean;
  created_at?: Date;
  updated_at?: Date;
  material?: Material;
  store?: Store;
}

// Interface for Store
export interface Store {
  id: number;
  name: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interface for Stock Movement
export interface StockMovement {
  id: number;
  material_id: number;
  store_id: number;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_by?: number;
  created_at?: Date;
  material?: Material;
  store?: Store;
  createdBy?: User;
}

// Interface for Procurement Recommendation
export interface ProcurementRecommendation {
  material_id: number;
  material_name: string;
  current_stock: number;
  reorder_level: number;
  low_stock_threshold: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  suggested_qty: number;
  reason: string;
}

// Interface for Request
export interface Request {
  id: number;
  site_id: number;
  status: 'APPROVED' | 'ISSUED' | 'PARTIALLY_ISSUED';
  requested_by?: number;
  issued_by?: number;
  issued_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  items?: RequestItem[];
  requestedBy?: User;
  site?: Site;
}

// Interface for Request Item
export interface RequestItem {
  id: number;
  request_id: number;
  material_id: number;
  qty_issued: number;
  issued_at?: Date;
  issued_by?: number;
  material?: Material;
}

// Interface for User
export interface User {
  id: number;
  full_name: string;
  email: string;
}

// Interface for Site
export interface Site {
  id: number;
  name: string;
}

// Interface for Material (imported from MaterialService, included for completeness)
export interface Material {
  id: number;
  name: string;
  unit_id: number;
  unit?: Unit;
  category?: Category;
}

// Interface for Unit
export interface Unit {
  id: number;
  name: string;
  symbol: string;
}

// Interface for Category
export interface Category {
  id: number;
  name: string;
}

// Interfaces for input data
export type CreateStockInput = Omit<Stock, 'id' | 'created_at' | 'updated_at' | 'material' | 'store' | 'low_stock_alert'>;
export type UpdateStockInput = Partial<CreateStockInput & { low_stock_alert?: boolean }>;
export type IssueMaterialsInput = {
  request_id: number;
  items: {
    request_item_id: number;
    qty_issued: number;
    store_id: number;
    notes?: string;
  }[];
};
export type SetLowStockThresholdInput = {
  low_stock_threshold: number;
};

// Interface for filtering
interface StockFilterParams {
  page?: number;
  limit?: number;
  store_id?: number;
  material_id?: number;
  low_stock?: boolean;
}

interface StockMovementsFilterParams {
  page?: number;
  limit?: number;
  store_id?: number;
  material_id?: number;
  type?: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
}

interface ProcurementRecommendationsFilterParams {
  page?: number;
  limit?: number;
  store_id?: number;
}

interface IssuableRequestsFilterParams {
  page?: number;
  limit?: number;
  site_id?: number;
}

interface IssuedMaterialsFilterParams {
  page?: number;
  limit?: number;
  request_id?: number;
  site_id?: number;
  date_from?: string;
  date_to?: string;
}

interface LowStockAlertsFilterParams {
  page?: number;
  limit?: number;
  store_id?: number;
}

// Extend the filter params interface
interface StockHistoryFilterParams {
  page?: number;
  limit?: number;
  stock_id?: number;
  material_id?: number;
  store_id?: number;
  movement_type?: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  date_from?: string;
  date_to?: string;
}

// Interface for pagination
interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Interface for delete response
interface DeleteResponse {
  success: boolean;
  message: string;
}

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Stock Service
 * Handles all stock-related API calls
 */
class StockService {
  private api: AxiosInstance = api;

  // =============== STOCK METHODS ===============
  /**
   * Get all stock levels
   * @param params - Query parameters for filtering
   * @returns Array of stock with pagination
   */
  async getAllStock(params?: StockFilterParams): Promise<{ stock: Stock[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());
      if (params?.material_id) queryParams.append('material_id', params.material_id.toString());
      if (params?.low_stock !== undefined) queryParams.append('low_stock', params.low_stock.toString());

      const response: AxiosResponse<{ success: boolean; data: { stock: Stock[]; pagination: Pagination } }> =
        await this.api.get(`/stock?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stock:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stock';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get stock by ID
   * @param id - Stock ID
   * @returns Stock or null if not found
   */
  async getStockById(id: number | string): Promise<Stock | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { stock: Stock } }> =
        await this.api.get(`/stock/${id}`);
      return response.data.data.stock;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching stock by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stock';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new stock record
   * @param stockData - Stock data
   * @returns Created stock
   */
  async createStock(stockData: CreateStockInput): Promise<Stock> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { stock: Stock }; message: string }> =
        await this.api.post('/stock', stockData);
      return response.data.data.stock;
    } catch (error: any) {
      console.error('Error creating stock:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create stock';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a stock record
   * @param id - Stock ID
   * @param updateData - Data to update
   * @returns Updated stock
   */
  async updateStock(id: number | string, updateData: UpdateStockInput): Promise<Stock> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { stock: Stock }; message: string }> =
        await this.api.put(`/stock/${id}`, updateData);
      return response.data.data.stock;
    } catch (error: any) {
      console.error('Error updating stock:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update stock';
      throw new Error(errorMessage);
    }
  }

  /**
   * Set low stock threshold
   * @param id - Stock ID
   * @param thresholdData - Threshold data
   * @returns Updated stock
   */
  async setLowStockThreshold(id: number | string, thresholdData: SetLowStockThresholdInput): Promise<Stock> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { stock: Stock }; message: string }> =
        await this.api.put(`/stock/${id}/threshold`, thresholdData);
      return response.data.data.stock;
    } catch (error: any) {
      console.error('Error setting low stock threshold:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to set low stock threshold';
      throw new Error(errorMessage);
    }
  }

  /**
   * Acknowledge low stock alert
   * @param id - Stock ID
   * @returns Updated stock
   */
  async acknowledgeLowStockAlert(id: number | string): Promise<Stock> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { stock: Stock }; message: string }> =
        await this.api.put(`/stock/${id}/acknowledge-alert`);
      return response.data.data.stock;
    } catch (error: any) {
      console.error('Error acknowledging low stock alert:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to acknowledge low stock alert';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get low stock alerts
   * @param params - Query parameters for filtering
   * @returns Array of low stock items with pagination
   */
  async getLowStockAlerts(params?: LowStockAlertsFilterParams): Promise<{ lowStockItems: Stock[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());

      const response: AxiosResponse<{ success: boolean; data: { lowStockItems: Stock[]; pagination: Pagination } }> =
        await this.api.get(`/stock/alerts/low-stock?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching low stock alerts:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch low stock alerts';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get stock movements
   * @param params - Query parameters for filtering
   * @returns Array of stock movements with pagination
   */
  async getStockMovements(params?: StockMovementsFilterParams): Promise<{ movements: StockMovement[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());
      if (params?.material_id) queryParams.append('material_id', params.material_id.toString());
      if (params?.type) queryParams.append('type', params.type);

      const response: AxiosResponse<{ success: boolean; data: { movements: StockMovement[]; pagination: Pagination } }> =
        await this.api.get(`/stock/movements?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stock movements:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stock movements';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get procurement recommendations
   * @param params - Query parameters for filtering
   * @returns Array of procurement recommendations with pagination
   */
  async getProcurementRecommendations(params?: ProcurementRecommendationsFilterParams): Promise<{ recommendations: (Stock & { procurementRecommendation: ProcurementRecommendation })[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());

      const response: AxiosResponse<{ success: boolean; data: { recommendations: (Stock & { procurementRecommendation: ProcurementRecommendation })[]; pagination: Pagination } }> =
        await this.api.get(`/stock/procurement-recommendations?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching procurement recommendations:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch procurement recommendations';
      throw new Error(errorMessage);
    }
  }

  /**
   * Issue materials to site engineers
   * @param issueData - Issue materials data
   * @returns Issued materials response
   */
  async issueMaterials(issueData: IssueMaterialsInput): Promise<{
    request_id: number;
    issued_items: { request_item_id: number; material_name: string; qty_issued: number; store_id: number }[];
    stock_movements: StockMovement[];
    request_status: 'ISSUED' | 'PARTIALLY_ISSUED';
  }> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: {
          request_id: number;
          issued_items: { request_item_id: number; material_name: string; qty_issued: number; store_id: number }[];
          stock_movements: StockMovement[];
          request_status: 'ISSUED' | 'PARTIALLY_ISSUED';
        };
        message: string;
      }> = await this.api.post('/stock/issue-materials', issueData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error issuing materials:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to issue materials';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get issuable requests
   * @param params - Query parameters for filtering
   * @returns Array of issuable requests with pagination
   */
  async getIssuableRequests(params?: IssuableRequestsFilterParams): Promise<{ requests: Request[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());

      const response: AxiosResponse<{ success: boolean; data: { requests: Request[]; pagination: Pagination } }> =
        await this.api.get(`/stock/issuable-requests?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching issuable requests:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch issuable requests';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get issued materials history
   * @param params - Query parameters for filtering
   * @returns Array of issued materials with pagination
   */
  async getIssuedMaterials(params?: IssuedMaterialsFilterParams): Promise<{ issued_materials: StockMovement[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.request_id) queryParams.append('request_id', params.request_id.toString());
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<{ success: boolean; data: { issued_materials: StockMovement[]; pagination: Pagination } }> =
        await this.api.get(`/stock/issued-materials?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching issued materials:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch issued materials';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get stock history with filtering and pagination
   * @param params - Query parameters for filtering
   * @returns Array of stock history with pagination
   */
  async getStockHistory(params?: StockHistoryFilterParams): Promise<{ history: StockMovement[]; pagination: Pagination }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.stock_id) queryParams.append('stock_id', params.stock_id.toString());
      if (params?.material_id) queryParams.append('material_id', params.material_id.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());
      if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<{ success: boolean; data: { history: StockMovement[]; pagination: Pagination } }> =
        await this.api.get(`/stock/history?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stock history:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stock history';
      throw new Error(errorMessage);
    }
  }

  // =============== VALIDATION METHODS ===============
  /**
   * Validate stock data
   * @param data - Stock data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateStockData(data: CreateStockInput): ValidationResult {
    const errors: string[] = [];

    if (!data.material_id) {
      errors.push('Material ID is required');
    }
    if (!data.store_id) {
      errors.push('Store ID is required');
    }
    if (data.qty_on_hand === undefined || data.qty_on_hand < 0) {
      errors.push('Quantity on hand is required and must be non-negative');
    }
    if (data.reorder_level && data.reorder_level < 0) {
      errors.push('Reorder level must be non-negative');
    }
    if (data.low_stock_threshold && data.low_stock_threshold < 0) {
      errors.push('Low stock threshold must be non-negative');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate issue materials data
   * @param data - Issue materials data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateIssueMaterialsData(data: IssueMaterialsInput): ValidationResult {
    const errors: string[] = [];

    if (!data.request_id) {
      errors.push('Request ID is required');
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Items array is required and must not be empty');
    }

    data.items?.forEach((item, index) => {
      if (!item.request_item_id) {
        errors.push(`Item ${index + 1}: Request item ID is required`);
      }
      if (!item.store_id) {
        errors.push(`Item ${index + 1}: Store ID is required`);
      }
      if (item.qty_issued === undefined || item.qty_issued <= 0) {
        errors.push(`Item ${index + 1}: Quantity issued must be greater than zero`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const stockService = new StockService();
export default stockService;

// Named exports for individual methods
export const {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  setLowStockThreshold,
  acknowledgeLowStockAlert,
  getLowStockAlerts,
  getStockMovements,
  getProcurementRecommendations,
  issueMaterials,
  getIssuableRequests,
  getIssuedMaterials,
  validateStockData,
  validateIssueMaterialsData,
} = stockService;