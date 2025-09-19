import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Package,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
} from "lucide-react";
import reportService, { type StockReport, type ReportSummary } from "../../../services/reportService";
import storeService, { type Store } from "../../../services/storeService";

type ViewMode = "table" | "grid" | "list";

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

interface ReportFilters {
  store_id: string;
  low_stock_only: boolean;
}

const InventoryReportsPage: React.FC = () => {
  const [reports, setReports] = useState<StockReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof StockReport>("material_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockReport | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    store_id: "",
    low_stock_only: false,
  });

  useEffect(() => {
    loadStores();
    loadReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const loadStores = async () => {
    try {
      const storesResponse = await storeService.getAllStores();
      setStores(storesResponse.stores || []);
    } catch (err: any) {
      console.error("Failed to load stores:", err);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.store_id) params.store_id = parseInt(filters.store_id);
      if (filters.low_stock_only) params.low_stock_only = filters.low_stock_only;

      const response = await reportService.getInventoryReports(params);
      
      if (response.success && response.data) {
        setReports(response.data.inventory as StockReport[] || []);
        setSummary(response.data.summary as ReportSummary || {});
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load stock reports");
      setReports([]);
      setSummary({});
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const filteredReports = useMemo(() => {
    let filtered = reports.filter(
      (report) =>
        (!searchTerm.trim() ||
          report.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.material?.code?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "material_id":
          aValue = a.material?.name;
          bValue = b.material?.name;
          break;
        case "qty_on_hand":
        case "reorder_level":
          aValue = a[sortBy];
          bValue = b[sortBy];
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortBy === "qty_on_hand" || sortBy === "reorder_level") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      else return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    return filtered;
  }, [reports, searchTerm, sortBy, sortOrder]);

  const handleFilterChange = (name: keyof ReportFilters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadReports();
    showOperationStatus("info", "Filters applied successfully");
  };

  const clearFilters = () => {
    setFilters({
      store_id: "",
      low_stock_only: false,
    });
    loadReports();
  };

  const handleViewStock = (stock: StockReport) => {
    setSelectedStock(stock);
    setShowViewModal(true);
  };

  const getStockStatusColor = (report: StockReport) => {
    if (report.qty_on_hand <= 0) return "text-red-700 bg-red-100";
    if (report.low_stock_alert || report.qty_on_hand <= report.reorder_level) return "text-yellow-700 bg-yellow-100";
    return "text-green-700 bg-green-100";
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return "-";
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => setSortBy("material_id")}
              >
                <div className="flex items-center space-x-1">
                  <span>Stock Item</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "material_id" ? "text-primary-600" : "text-gray-400"}`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Code</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => setSortBy("qty_on_hand")}
              >
                <div className="flex items-center space-x-1">
                  <span>Qty on Hand</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "qty_on_hand" ? "text-primary-600" : "text-gray-400"}`}
                  />
                </div>
              </th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => setSortBy("reorder_level")}
              >
                <div className="flex items-center space-x-1">
                  <span>Reorder Level</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "reorder_level" ? "text-primary-600" : "text-gray-400"}`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentReports.map((report, index) => (
              <tr key={report.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{report.material?.name || "-"}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{report.material?.code || "-"}</td>
                <td className="py-2 px-2 text-gray-700">
                  {report.qty_on_hand} {report.material?.unit?.symbol || ""}
                </td>
                <td className="py-2 px-2 text-gray-700">
                  {report.reorder_level} {report.material?.unit?.symbol || ""}
                </td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(report)}`}>
                    {report.qty_on_hand <= 0
                      ? "Out of Stock"
                      : report.low_stock_alert || report.qty_on_hand <= report.reorder_level
                      ? "Low Stock"
                      : "In Stock"}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewStock(report)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </td>
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
        <div
          key={report.id}
          className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{report.material?.name || "-"}</div>
              <div className="text-gray-500 text-xs truncate">{report.material?.code || "-"}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                Qty: {report.qty_on_hand} {report.material?.unit?.symbol || ""}
              </span>
              <span className={`px-2 py-1 rounded-full font-medium ${getStockStatusColor(report)}`}>
                {report.qty_on_hand <= 0
                  ? "Out of Stock"
                  : report.low_stock_alert || report.qty_on_hand <= report.reorder_level
                  ? "Low Stock"
                  : "In Stock"}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Reorder Level: {report.reorder_level} {report.material?.unit?.symbol || ""}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleViewStock(report)}
              className="text-gray-400 hover:text-primary-600 p-1"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </button>
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
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{report.material?.name || "-"}</div>
                <div className="text-gray-500 text-xs truncate">{report.material?.code || "-"}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">
                Qty: {report.qty_on_hand} {report.material?.unit?.symbol || ""}
              </span>
              <span className="truncate">
                Reorder: {report.reorder_level} {report.material?.unit?.symbol || ""}
              </span>
              <span className={`px-2 py-1 rounded-full font-medium text-center ${getStockStatusColor(report)}`}>
                {report.qty_on_hand <= 0
                  ? "Out of Stock"
                  : report.low_stock_alert || report.qty_on_hand <= report.reorder_level
                  ? "Low Stock"
                  : "In Stock"}
              </span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewStock(report)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Stock Details"
              >
                <Eye className="w-4 h-4" />
              </button>
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Stock Reports</h1>
                <p className="text-xs text-gray-500 mt-0.5">Track and manage stock levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadReports}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Stock Items</p>
                <p className="text-lg font-semibold text-gray-900">{summary.total_items || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Low Stock Items</p>
                <p className="text-lg font-semibold text-gray-900">{summary.low_stock_items || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Out of Stock Items</p>
                <p className="text-lg font-semibold text-gray-900">{summary.out_of_stock_items || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Stock Value</p>
                <p className="text-lg font-semibold text-gray-900">${(summary.total_value || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stock items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? "bg-primary-50 border-primary-200 text-primary-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
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
                  const [field, order] = e.target.value.split("-") as [keyof StockReport, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="material_id-asc">Stock Item (A-Z)</option>
                <option value="material_id-desc">Stock Item (Z-A)</option>
                <option value="qty_on_hand-desc">Qty (High-Low)</option>
                <option value="qty_on_hand-asc">Qty (Low-High)</option>
                <option value="reorder_level-desc">Reorder (High-Low)</option>
                <option value="reorder_level-asc">Reorder (Low-High)</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                  <select
                    value={filters.store_id}
                    onChange={(e) => handleFilterChange("store_id", e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Stores</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id?.toString()}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.low_stock_only}
                    onChange={(e) => handleFilterChange("low_stock_only", e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-200 rounded"
                  />
                  <label className="text-xs font-medium text-gray-700">Show Low Stock Only</label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                >
                  Clear Filters
                </button>
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
              <span className="text-xs">Loading stock reports...</span>
            </div>
          </div>
        ) : currentReports.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || filters.store_id || filters.low_stock_only
                ? "No stock items found matching your criteria"
                : "No stock reports found"}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === "table" && renderTableView()}
            {viewMode === "grid" && renderGridView()}
            {viewMode === "list" && renderListView()}
            {renderPagination()}
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
              operationStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : operationStatus.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-primary-50 border border-primary-200 text-primary-800"
            }`}
          >
            {operationStatus.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-4 h-4 text-primary-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {showViewModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Stock Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStock(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Stock Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stock ID</label>
                    <p className="text-xs text-gray-900">#{selectedStock.id}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stock Item</label>
                    <p className="text-xs text-gray-900">{selectedStock.material?.name || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stock Code</label>
                    <p className="text-xs text-gray-900">{selectedStock.material?.code || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                    <p className="text-xs text-gray-900">
                      {stores.find((store) => store.id === selectedStock.store_id)?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-xs text-gray-900">{selectedStock.material?.category?.name || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity on Hand</label>
                    <p className="text-xs text-gray-900">
                      {selectedStock.qty_on_hand} {selectedStock.material?.unit?.symbol || ""}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Level</label>
                    <p className="text-xs text-gray-900">
                      {selectedStock.reorder_level} {selectedStock.material?.unit?.symbol || ""}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <p className="text-xs text-gray-900">
                      {selectedStock.low_stock_threshold || 0} {selectedStock.material?.unit?.symbol || ""}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(selectedStock)}`}>
                      {selectedStock.qty_on_hand <= 0
                        ? "Out of Stock"
                        : selectedStock.low_stock_alert || selectedStock.qty_on_hand <= selectedStock.reorder_level
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                    <p className="text-xs text-gray-900">
                      ${selectedStock.material?.unit_price?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-xs text-gray-900">
                      {selectedStock.material?.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
                    <p className="text-xs text-gray-900">
                      {selectedStock.material?.specifications || "No specifications provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                    <p className="text-xs text-gray-900">{formatDate(selectedStock.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                    <p className="text-xs text-gray-900">{formatDate(selectedStock.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStock(null);
                }}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReportsPage;