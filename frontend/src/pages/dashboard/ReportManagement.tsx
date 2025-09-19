import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Package,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  FileText,
} from "lucide-react";
import reportService, {
  type RequestReport,
  type InventoryReport,
  type StockMovementReport,
  type ProcurementReport,
  type UserActivityReport,
  type SitePerformanceReport,
  type ReportSummary,
} from "../../services/reportService";
import materialService, { type Material } from "../../services/materialsService";
import storeService, { type Store } from "../../services/storeService";
import { useNavigate } from "react-router-dom";

type ViewMode = 'table' | 'grid' | 'list';
type ReportType = 'requests' | 'inventory' | 'stockMovements' | 'procurement' | 'userActivity' | 'sitePerformance';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

interface FilterParams {
  date_from?: string;
  date_to?: string;
  store_id?: number;
  material_id?: number;
  status?: string;
}

const ReportDashboard: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [reports, setReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({});
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [reportType, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportResponse, materialsResponse, storesResponse] = await Promise.all([
        fetchReportData(),
        materialService.getAllMaterials(),
        storeService.getAllStores(),
      ]);
      setAllReports(reportResponse.data[reportType] || []);
      setSummary(reportResponse.data.summary || {});
      setMaterials(materialsResponse || []);
      setStores(storesResponse.stores || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    switch (reportType) {
      case 'requests':
        return await reportService.getRequestReports(filters);
      case 'inventory':
        return await reportService.getInventoryReports(filters);
      case 'stockMovements':
        return await reportService.getStockMovementReports(filters);
      case 'procurement':
        return await reportService.getProcurementReports(filters);
      case 'userActivity':
        return await reportService.getUserActivityReports(filters);
      case 'sitePerformance':
        return await reportService.getSitePerformanceReports(filters);
      default:
        return { success: false, data: { [reportType]: [], summary: {} } };
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allReports]);

  const handleFilterAndSort = () => {
    let filtered = [...allReports];

    if (searchTerm.trim()) {
      filtered = filtered.filter((report) => {
        if (reportType === 'requests') {
          return report.items?.some((item: any) => item.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        } else if (reportType === 'inventory' || reportType === 'stockMovements' || reportType === 'procurement') {
          return report.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 report.store?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (reportType === 'userActivity') {
          return report.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (reportType === 'sitePerformance') {
          return report.site_name?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "material_id") {
        aValue = a.material?.name;
        bValue = b.material?.name;
      } else if (sortBy === "store_id") {
        aValue = a.store?.name;
        bValue = b.store?.name;
      } else if (sortBy === "created_at") {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      }

      if (sortBy === "created_at") {
        return sortOrder === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      aValue = aValue ? aValue.toString().toLowerCase() : "";
      bValue = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      else return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    setReports(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value === "" ? undefined : value });
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return new Date().toLocaleDateString("en-GB");
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => setSortBy("id")}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "id" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              {reportType !== 'userActivity' && reportType !== 'sitePerformance' && (
                <th 
                  className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell" 
                  onClick={() => setSortBy("material_id")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Material</span>
                    <ChevronDown className={`w-3 h-3 ${sortBy === "material_id" ? "text-primary-600" : "text-gray-400"}`} />
                  </div>
                </th>
              )}
              {(reportType === 'inventory' || reportType === 'stockMovements') && (
                <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
              )}
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">
                {reportType === 'requests' ? 'Status' : 
                 reportType === 'inventory' ? 'Quantity' : 
                 reportType === 'stockMovements' ? 'Movement Type' : 
                 reportType === 'procurement' ? 'Status' : 
                 reportType === 'userActivity' ? 'User Name' : 
                 'Site Name'}
              </th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell" 
                onClick={() => setSortBy("created_at")}
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "created_at" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentReports.map((report, index) => (
              <tr key={report.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{report.id}</td>
                {reportType !== 'userActivity' && reportType !== 'sitePerformance' && (
                  <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                    {reportType === 'requests' ? report.items?.[0]?.material?.name : report.material?.name}
                  </td>
                )}
                {(reportType === 'inventory' || reportType === 'stockMovements') && (
                  <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{report.store?.name}</td>
                )}
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  {reportType === 'requests' ? report.status :
                   reportType === 'inventory' ? report.qty_on_hand :
                   reportType === 'stockMovements' ? report.movement_type :
                   reportType === 'procurement' ? report.status :
                   reportType === 'userActivity' ? report.user_name :
                   report.site_name}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(report.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentReports.map((report) => (
        <div key={report.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">
                {reportType === 'requests' ? `Request #${report.id}` :
                 reportType === 'inventory' ? report.material?.name :
                 reportType === 'stockMovements' ? report.material?.name :
                 reportType === 'procurement' ? `PO #${report.id}` :
                 reportType === 'userActivity' ? report.user_name :
                 report.site_name}
              </div>
              {(reportType === 'inventory' || reportType === 'stockMovements') && (
                <div className="text-gray-500 text-xs truncate">{report.store?.name}</div>
              )}
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <FileText className="w-3 h-3" />
              <span>
                {reportType === 'requests' ? `Status: ${report.status}` :
                 reportType === 'inventory' ? `Qty: ${report.qty_on_hand}` :
                 reportType === 'stockMovements' ? `Type: ${report.movement_type}` :
                 reportType === 'procurement' ? `Status: ${report.status}` :
                 reportType === 'userActivity' ? `Requests: ${report.total_requests}` :
                 `Requests: ${report.total_requests}`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentReports.map((report) => (
        <div key={report.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {reportType === 'requests' ? `Request #${report.id}` :
                   reportType === 'inventory' ? report.material?.name :
                   reportType === 'stockMovements' ? report.material?.name :
                   reportType === 'procurement' ? `PO #${report.id}` :
                   reportType === 'userActivity' ? report.user_name :
                   report.site_name}
                </div>
                {(reportType === 'inventory' || reportType === 'stockMovements') && (
                  <div className="text-gray-500 text-xs truncate">{report.store?.name}</div>
                )}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">
                {reportType === 'requests' ? `Status: ${report.status}` :
                 reportType === 'inventory' ? `Qty: ${report.qty_on_hand}` :
                 reportType === 'stockMovements' ? `Type: ${report.movement_type}` :
                 reportType === 'procurement' ? `Status: ${report.status}` :
                 reportType === 'userActivity' ? `Requests: ${report.total_requests}` :
                 `Requests: ${report.total_requests}`}
              </span>
              <span>{formatDate(report.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, reports.length)} of {reports.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === page
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Toggle Sidebar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Report Dashboard</h1>
                <p className="text-xs text-gray-500 mt-0.5">View and analyze your organization's reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.total_requests && (
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Requests</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.total_requests}</p>
                </div>
              </div>
            </div>
          )}
          {summary.low_stock_items && (
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Low Stock Items</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.low_stock_items}</p>
                </div>
              </div>
            </div>
          )}
          {summary.total_orders && (
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Orders</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.total_orders}</p>
                </div>
              </div>
            </div>
          )}
          {summary.total_value && (
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">${summary.total_value.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="requests">Request Reports</option>
                <option value="inventory">Inventory Reports</option>
                <option value="stockMovements">Stock Movement Reports</option>
                <option value="procurement">Procurement Reports</option>
                <option value="userActivity">User Activity Reports</option>
                <option value="sitePerformance">Site Performance Reports</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [string, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="id-asc">ID (Low-High)</option>
                <option value="id-desc">ID (High-Low)</option>
                {reportType !== 'userActivity' && reportType !== 'sitePerformance' && (
                  <option value="material_id-asc">Material (A-Z)</option>
                )}
                {(reportType === 'inventory' || reportType === 'stockMovements') && (
                  <option value="store_id-asc">Store (A-Z)</option>
                )}
                <option value="created_at-desc">Newest</option>
                <option value="created_at-asc">Oldest</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  name="date_from"
                  value={filters.date_from || ""}
                  onChange={handleFilterChange}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="date"
                  name="date_to"
                  value={filters.date_to || ""}
                  onChange={handleFilterChange}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {(reportType === 'inventory' || reportType === 'stockMovements') && (
                  <select
                    name="store_id"
                    value={filters.store_id || ""}
                    onChange={handleFilterChange}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Stores</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                )}
                {(reportType === 'requests' || reportType === 'procurement') && (
                  <select
                    name="status"
                    value={filters.status || ""}
                    onChange={handleFilterChange}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                )}
                {(reportType === 'inventory' || reportType === 'stockMovements' || reportType === 'procurement') && (
                  <select
                    name="material_id"
                    value={filters.material_id || ""}
                    onChange={handleFilterChange}
                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Materials</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>{material.name}</option>
                    ))}
                  </select>
                )}
                {(filters.date_from || filters.date_to || filters.store_id || filters.material_id || filters.status) && (
                  <button
                    onClick={() => setFilters({})}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading reports...</span>
            </div>
          </div>
        ) : currentReports.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || Object.keys(filters).length ? 'No reports found matching your criteria' : 'No reports found'}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
            operationStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            operationStatus.type === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-primary-50 border border-primary-200 text-primary-800"
          }`}>
            <AlertCircle className={`w-4 h-4 ${
              operationStatus.type === "success" ? "text-green-600" :
              operationStatus.type === "error" ? "text-red-600" : "text-primary-600"
            }`} />
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;