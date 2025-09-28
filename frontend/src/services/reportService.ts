import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api';

// Interface for Material (simplified, referencing the MaterialService)
export interface Material {
  id: number;
  name: string;
  code?: string;
  unit_price?: number;
  description?: string;
  unit?: {
    id: number;
    name: string;
    symbol: string;
  };
}

// Interface for Request Item
export interface RequestItem {
  id: number;
  request_id: number;
  material_id: number;
  qty_requested: number;
  qty_approved?: number;
  material?: Material;
}

// Interface for Request Report
export interface RequestReport {
  id: number;
  site_id?: number;
  requested_by?: number;
  notes?: string;
  status: string;
  created_at: Date | string;
  updated_at?: Date | string;
  site?: {
    id: number;
    code: string;
    name: string;
    location: string;
    created_at: Date | string;
    updated_at: Date | string;
  };
  requestedBy?: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    role?: {
      id: number;
      name: string;
    };
    active?: boolean;
    created_at?: Date | string;
    updated_at?: Date | string;
  };
  items: RequestItem[];
  approvals?: {
    id: number;
    level: string;
    action: string;
    comment?: string;
    reviewer?: {
      id: number;
      full_name: string;
      email: string;
      phone?: string;
      role?: {
        id: number;
        name: string;
      };
      active?: boolean;
      created_at?: Date | string;
      updated_at?: Date | string;
    };
    created_at: Date | string;
  }[];
}

// Interface for Inventory Report
export interface InventoryReport {
  id: number;
  store_id?: number;
  material_id: number;
  qty_on_hand: number;
  reorder_level: number;
  material?: Material;
}

// Interface for Stock Movement Report
export interface StockMovementReport {
  id: number;
  store_id?: number;
  material_id: number;
  movement_type: string;
  qty: number;
  created_at: Date;
  material?: Material;
}

// Interface for Procurement Report
export interface ProcurementReport {
  id: number;
  supplier_id?: number;
  status: string;
  created_at: Date;
  items: PurchaseOrderItem[];
}

// Interface for Purchase Order Item
export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  material_id: number;
  qty_ordered: number;
  unit_price: number;
  material?: Material;
}

// Interface for User Activity Report
export interface UserActivityReport {
  [userId: string]: {
    user_name: string;
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
  };
}

// Interface for Site Performance Report
export interface SitePerformanceReport {
  [siteId: string]: {
    site_name: string;
    total_requests: number;
    total_value: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
    average_processing_time: number;
  };
}

// Interface for Report Summary
export interface ReportSummary {
  total_requests?: number;
  total_value?: number;
  status_breakdown?: { [key: string]: number };
  total_items?: number;
  low_stock_items?: number;
  out_of_stock_items?: number;
  total_in?: number;
  total_out?: number;
  total_adjustments?: number;
  total_orders?: number;
  pending_orders?: number;
  completed_orders?: number;
  total_users?: number;
  total_sites?: number;
}

// Interface for filter parameters
interface ReportFilterParams {
  site_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  store_id?: number;
  low_stock_only?: boolean;
  material_id?: number;
  movement_type?: string;
  supplier_id?: number;
  user_id?: number;
}

// Interface for report response
interface ReportResponse<T> {
  success: boolean;
  data: {
    [key: string]: T | ReportSummary;
  };
}

/**
 * Report Service
 * Handles all report-related API calls
 */
class ReportService {
  private api: AxiosInstance = api;

  /**
   * Get request reports
   * @param params - Query parameters for filtering
   * @returns Request reports with summary
   */
  async getRequestReports(params?: ReportFilterParams): Promise<ReportResponse<RequestReport[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<ReportResponse<RequestReport[]>> = 
        await this.api.get(`/reports/requests?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching request reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch request reports';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get inventory reports
   * @param params - Query parameters for filtering
   * @returns Inventory reports with summary
   */
  async getInventoryReports(params?: ReportFilterParams): Promise<ReportResponse<InventoryReport[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());
      if (params?.low_stock_only) queryParams.append('low_stock_only', params.low_stock_only.toString());

      const response: AxiosResponse<ReportResponse<InventoryReport[]>> = 
        await this.api.get(`/reports/inventory?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching inventory reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch inventory reports';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get stock movement reports
   * @param params - Query parameters for filtering
   * @returns Stock movement reports with summary
   */
  async getStockMovementReports(params?: ReportFilterParams): Promise<ReportResponse<StockMovementReport[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());
      if (params?.material_id) queryParams.append('material_id', params.material_id.toString());
      if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<ReportResponse<StockMovementReport[]>> = 
        await this.api.get(`/reports/stock-movements?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock movement reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch stock movement reports';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get procurement reports
   * @param params - Query parameters for filtering
   * @returns Procurement reports with summary
   */
  async getProcurementReports(params?: ReportFilterParams): Promise<ReportResponse<ProcurementReport[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<ReportResponse<ProcurementReport[]>> = 
        await this.api.get(`/reports/procurement?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching procurement reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch procurement reports';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user activity reports
   * @param params - Query parameters for filtering
   * @returns User activity reports with summary
   */
  async getUserActivityReports(params?: ReportFilterParams): Promise<ReportResponse<UserActivityReport>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<ReportResponse<UserActivityReport>> = 
        await this.api.get(`/reports/user-activity?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user activity reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch user activity reports';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get site performance reports
   * @param params - Query parameters for filtering
   * @returns Site performance reports with summary
   */
  async getSitePerformanceReports(params?: ReportFilterParams): Promise<ReportResponse<SitePerformanceReport>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.site_id) queryParams.append('site_id', params.site_id.toString());
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const response: AxiosResponse<ReportResponse<SitePerformanceReport>> = 
        await this.api.get(`/reports/site-performance?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching site performance reports:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch site performance reports';
      throw new Error(errorMessage);
    }
  }
}

// Singleton instance
const reportService = new ReportService();
export default reportService;

// Named exports for individual methods
export const {
  getRequestReports,
  getInventoryReports,
  getStockMovementReports,
  getProcurementReports,
  getUserActivityReports,
  getSitePerformanceReports,
} = reportService;