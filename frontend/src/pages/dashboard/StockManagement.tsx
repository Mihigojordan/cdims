import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Package,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  Check,
} from "lucide-react";
import stockService, { type CreateStockInput, type ValidationResult, type Stock, type SetLowStockThresholdInput } from "../../services/stockService";
import materialService, { type Material } from "../../services/materialsService";
import storeService, { type Store } from "../../services/storeService";
import { useNavigate } from "react-router-dom";

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const StockDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [alerts, setAlerts] = useState<Stock[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Stock[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [alertSearchTerm, setAlertSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Stock>("material_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [alertSortBy, setAlertSortBy] = useState<keyof Stock>("material_id");
  const [alertSortOrder, setAlertSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [alertsCurrentPage, setAlertsCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [alertsItemsPerPage] = useState<number>(5);
  const [deleteConfirm, setDeleteConfirm] = useState<Stock | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedAlertStore, setSelectedAlertStore] = useState("");
  const [selectedAlertMaterial, setSelectedAlertMaterial] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedThresholdStock, setSelectedThresholdStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState<CreateStockInput>({
    material_id: 0,
    store_id: 0,
    qty_on_hand: 0,
    low_stock_threshold: 0,
  });
  const [thresholdFormData, setThresholdFormData] = useState<SetLowStockThresholdInput>({
    low_stock_threshold: 0,
  });
  const [formError, setFormError] = useState<string>('');
  const [thresholdFormError, setThresholdFormError] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allStocks, selectedStore]);

  useEffect(() => {
    handleAlertFilterAndSort();
  }, [alertSearchTerm, alertSortBy, alertSortOrder, alerts, selectedAlertStore, selectedAlertMaterial]);

  const loadData = async () => {
    try {
      setLoading(true);
      setAlertsLoading(true);
      const [stockResponse, materialsResponse, storesResponse, alertsResponse] = await Promise.all([
        stockService.getAllStock(),
        materialService.getAllMaterials(),
        storeService.getAllStores(),
        stockService.getLowStockAlerts({ page: 1, limit: 1000 }),
      ]);
      setAllStocks(stockResponse.stock || []);
      setMaterials(materialsResponse || []);
      setStores(storesResponse.stores || []);
      setAlerts(alertsResponse.lowStockItems || []);
      setError(null);
      setAlertsError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setAlertsError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
      setAlertsLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allStocks];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (stock) =>
          stock.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStore) {
      filtered = filtered.filter(stock => stock.store?.name?.toLowerCase() === selectedStore.toLowerCase());
    }

    filtered.sort((a, b) => {
      const aValue = sortBy === "material_id" ? a.material?.name : sortBy === "store_id" ? a.store?.name : a[sortBy];
      const bValue = sortBy === "material_id" ? b.material?.name : sortBy === "store_id" ? b.store?.name : b[sortBy];

      if (sortBy === "created_at" || sortBy === "updated_at") {
        const aDate = aValue ? new Date(aValue as string | Date) : new Date(0);
        const bDate = bValue ? new Date(bValue as string | Date) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setStocks(filtered);
    setCurrentPage(1);
  };

  const handleAlertFilterAndSort = () => {
    let filtered = [...alerts];

    if (alertSearchTerm.trim()) {
      filtered = filtered.filter(
        (alert) =>
          alert.material?.name?.toLowerCase().includes(alertSearchTerm.toLowerCase()) ||
          alert.store?.name?.toLowerCase().includes(alertSearchTerm.toLowerCase())
      );
    }

    if (selectedAlertStore) {
      filtered = filtered.filter(alert => alert.store?.name?.toLowerCase() === selectedAlertStore.toLowerCase());
    }

    if (selectedAlertMaterial) {
      filtered = filtered.filter(alert => alert.material?.name?.toLowerCase() === selectedAlertMaterial.toLowerCase());
    }

    filtered.sort((a, b) => {
      const aValue = alertSortBy === "material_id" ? a.material?.name : alertSortBy === "store_id" ? a.store?.name : a[alertSortBy];
      const bValue = alertSortBy === "material_id" ? b.material?.name : alertSortBy === "store_id" ? b.store?.name : b[alertSortBy];

      if (alertSortBy === "created_at" || alertSortBy === "updated_at") {
        const aDate = aValue ? new Date(aValue as string | Date) : new Date(0);
        const bDate = bValue ? new Date(bValue as string | Date) : new Date(0);
        return alertSortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      return alertSortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setFilteredAlerts(filtered);
    setAlertsCurrentPage(1);
  };

  const handleAddStock = () => {
    setFormData({
      material_id: 0,
      store_id: 0,
      qty_on_hand: 0,
      low_stock_threshold: 0,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'material_id' || name === 'store_id' || name === 'qty_on_hand' || name === 'low_stock_threshold' ? parseInt(value) || 0 : value });
  };

  const handleThresholdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setThresholdFormData({ low_stock_threshold: parseInt(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validation: ValidationResult = stockService.validateStockData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    try {
      setOperationLoading(true);
      const newStock = await stockService.createStock(formData);
      setShowAddModal(false);
      setFormData({
        material_id: 0,
        store_id: 0,
        qty_on_hand: 0,
        low_stock_threshold: 0,
      });
      loadData();
      showOperationStatus("success", `Stock for ${materials.find(m => m.id === newStock.material_id)?.name || 'material'} created successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to create stock");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validation: ValidationResult = stockService.validateStockData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    if (!selectedStock?.id) {
      setFormError("Invalid stock ID");
      return;
    }

    try {
      setOperationLoading(true);
      await stockService.updateStock(selectedStock.id, formData);
      setShowUpdateModal(false);
      setSelectedStock(null);
      setFormData({
        material_id: 0,
        store_id: 0,
        qty_on_hand: 0,
        low_stock_threshold: 0,
      });
      loadData();
      showOperationStatus("success", `Stock for ${materials.find(m => m.id === formData.material_id)?.name || 'material'} updated successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to update stock");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleThresholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setThresholdFormError('');

    if (!selectedThresholdStock?.id) {
      setThresholdFormError("Invalid stock ID");
      return;
    }

    if (thresholdFormData.low_stock_threshold < 0) {
      setThresholdFormError("Low stock threshold must be non-negative");
      return;
    }

    try {
      setOperationLoading(true);
      await stockService.setLowStockThreshold(selectedThresholdStock.id, thresholdFormData);
      setShowThresholdModal(false);
      setSelectedThresholdStock(null);
      setThresholdFormData({ low_stock_threshold: 0 });
      loadData();
      showOperationStatus("success", `Low stock threshold updated for ${selectedThresholdStock.material?.name || 'material'}`);
    } catch (err: any) {
      setThresholdFormError(err.message || "Failed to set low stock threshold");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (stock: Stock) => {
    if (!stock?.id) return;

    try {
      setOperationLoading(true);
      await stockService.acknowledgeLowStockAlert(stock.id);
      loadData();
      showOperationStatus("success", `Low stock alert acknowledged for ${stock.material?.name || 'material'}`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to acknowledge low stock alert");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSetThreshold = (stock: Stock) => {
    if (!stock?.id) return;
    setSelectedThresholdStock(stock);
    setThresholdFormData({ low_stock_threshold: stock.low_stock_threshold || 0 });
    setThresholdFormError('');
    setShowThresholdModal(true);
  };

  const handleEditStock = (stock: Stock) => {
    if (!stock?.id) return;
    setSelectedStock(stock);
    setFormData({
      material_id: stock.material_id || 0,
      store_id: stock.store_id || 0,
      qty_on_hand: stock.qty_on_hand || 0,
      low_stock_threshold: stock.low_stock_threshold || 0,
    });
    setShowUpdateModal(true);
  };

  const handleViewStock = (stock: Stock) => {
    if (!stock?.id) return;
    setSelectedStock(stock);
    setShowViewModal(true);
  };

  const handleDeleteStock = async (stock: Stock) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await stockService.updateStock(stock.id, { qty_on_hand: 0 });
      loadData();
      showOperationStatus("success", `Stock for ${stock.material?.name} deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete stock");
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return new Date().toLocaleDateString("en-GB");
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(stocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStocks = stocks.slice(startIndex, endIndex);

  const alertsTotalPages = Math.ceil(filteredAlerts.length / alertsItemsPerPage);
  const alertsStartIndex = (alertsCurrentPage - 1) * alertsItemsPerPage;
  const alertsEndIndex = alertsStartIndex + alertsItemsPerPage;
  const currentAlerts = filteredAlerts.slice(alertsStartIndex, alertsEndIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => {
                  setSortBy("material_id");
                  setSortOrder(sortBy === "material_id" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Material</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "material_id" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Qty on Hand</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Unit Price</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Total Price</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Created Date</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentStocks.map((stock, index) => (
              <tr key={stock.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{stock.material?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{stock.store?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{stock.qty_on_hand}</td>
                <td className="py-2 px-2 text-gray-700">
                  RWF {(stock.material?.unit_price || 0).toLocaleString()}
                </td>
                <td className="py-2 px-2 text-gray-700">
                  RWF {((stock.material?.unit_price || 0) * (stock.qty_on_hand || 0)).toLocaleString()}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(stock.created_at)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewStock(stock)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleEditStock(stock)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleSetThreshold(stock)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="Set Threshold"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(stock)} 
                      className="text-gray-400 hover:text-red-600 p-1" 
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
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
      {currentStocks.map((stock) => (
        <div key={stock.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{stock.material?.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">{stock.store?.name || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Package className="w-3 h-3" />
              <span>Qty: {stock.qty_on_hand}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewStock(stock)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditStock(stock)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
              <button onClick={() => handleSetThreshold(stock)} className="text-gray-400 hover:text-primary-600 p-1" title="Set Threshold">
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(stock)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentStocks.map((stock) => (
        <div key={stock.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{stock.material?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs truncate">{stock.store?.name || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">Qty: {stock.qty_on_hand}</span>
              <span>{formatDate(stock.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={() => handleViewStock(stock)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="View Stock"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditStock(stock)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="Edit Stock"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSetThreshold(stock)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="Set Threshold"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteConfirm(stock)} 
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" 
                title="Delete Stock"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlertsSection = () => (
    <div className="bg-white rounded border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h2>
        </div>
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="text-gray-400 hover:text-gray-600"
          title={showAlerts ? "Hide Alerts" : "Show Alerts"}
        >
          <ChevronDown className={`w-4 h-4 transform ${showAlerts ? "rotate-180" : ""}`} />
        </button>
      </div>
      {showAlerts && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={alertSearchTerm}
                  onChange={(e) => setAlertSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
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
            <select
              value={`${alertSortBy}-${alertSortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [keyof Stock, "asc" | "desc"];
                setAlertSortBy(field);
                setAlertSortOrder(order);
              }}
              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="material_id-asc">Material (A-Z)</option>
              <option value="material_id-desc">Material (Z-A)</option>
              <option value="store_id-asc">Store (A-Z)</option>
              <option value="store_id-desc">Store (Z-A)</option>
              <option value="qty_on_hand-asc">Quantity (Low-High)</option>
              <option value="qty_on_hand-desc">Quantity (High-Low)</option>
            </select>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedAlertStore}
                  onChange={(e) => setSelectedAlertStore(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>{store.name}</option>
                  ))}
                </select>
                <select
                  value={selectedAlertMaterial}
                  onChange={(e) => setSelectedAlertMaterial(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Materials</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.name}>{material.name}</option>
                  ))}
                </select>
                {(selectedAlertStore || selectedAlertMaterial) && (
                  <button
                    onClick={() => {
                      setSelectedAlertStore("");
                      setSelectedAlertMaterial("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
          {alertsError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs mt-3">
              {alertsError}
            </div>
          )}
          {alertsLoading ? (
            <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500 mt-3">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading alerts...</span>
              </div>
            </div>
          ) : currentAlerts.length === 0 ? (
            <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500 mt-3">
              <div className="text-xs">
                {alertSearchTerm || selectedAlertStore || selectedAlertMaterial
                  ? 'No alerts found matching your criteria'
                  : 'No low stock alerts at this time'}
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="bg-white rounded border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                        <th
                          className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setAlertSortBy("material_id");
                            setAlertSortOrder(alertSortBy === "material_id" && alertSortOrder === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Material</span>
                            <ChevronDown className={`w-3 h-3 ${alertSortBy === "material_id" ? "text-primary-600" : "text-gray-400"}`} />
                          </div>
                        </th>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Qty on Hand</th>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Unit Price</th>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Total Price</th>
                        <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Threshold</th>
                        <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentAlerts.map((alert, index) => (
                        <tr key={alert.id} className="hover:bg-gray-25">
                          <td className="py-2 px-2 text-gray-700">{alertsStartIndex + index + 1}</td>
                          <td className="py-2 px-2 font-medium text-gray-900 text-xs">{alert.material?.name || 'N/A'}</td>
                          <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{alert.store?.name || 'N/A'}</td>
                          <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{alert.qty_on_hand}</td>
                          <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                            RWF {(alert.material?.unit_price || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                            RWF {((alert.material?.unit_price || 0) * (alert.qty_on_hand || 0)).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{alert.low_stock_threshold}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center justify-end space-x-1">
                              {alert.low_stock_alert && (
                                <button
                                  onClick={() => handleAcknowledgeAlert(alert)}
                                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                  title="Acknowledge Alert"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {alertsTotalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200 mt-3">
                  <div className="text-xs text-gray-600">
                    Showing {alertsStartIndex + 1}-{Math.min(alertsEndIndex, filteredAlerts.length)} of {filteredAlerts.length}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setAlertsCurrentPage(alertsCurrentPage - 1)}
                      disabled={alertsCurrentPage === 1}
                      className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    {Array.from({ length: alertsTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setAlertsCurrentPage(page)}
                        className={`px-2 py-1 text-xs rounded ${
                          alertsCurrentPage === page
                            ? "bg-primary-500 text-white"
                            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setAlertsCurrentPage(alertsCurrentPage + 1)}
                      disabled={alertsCurrentPage === alertsTotalPages}
                      className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
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
          Showing {startIndex + 1}-{Math.min(endIndex, stocks.length)} of {stocks.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Stock Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your organization's stock</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                disabled={loading || alertsLoading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading || alertsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddStock}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Stock</span>
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
                <p className="text-lg font-semibold text-gray-900">{allStocks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Stores</p>
                <p className="text-lg font-semibold text-gray-900">{[...new Set(allStocks.map(stock => stock.store?.name))].filter(name => name).length}</p>
              </div>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Low Stock Alerts</p>
                  <p className="text-lg font-semibold text-gray-900">{alerts.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {alerts.length > 0 && renderAlertsSection()}

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stock..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
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
                  const [field, order] = e.target.value.split("-") as [keyof Stock, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="material_id-asc">Material (A-Z)</option>
                <option value="material_id-desc">Material (Z-A)</option>
                <option value="store_id-asc">Store (A-Z)</option>
                <option value="qty_on_hand-asc">Quantity (Low-High)</option>
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
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>{store.name}</option>
                  ))}
                </select>
                {selectedStore && (
                  <button
                    onClick={() => setSelectedStore("")}
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
              <span className="text-xs">Loading stock...</span>
            </div>
          </div>
        ) : currentStocks.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedStore ? 'No stock found matching your criteria' : 'No stock found'}
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

      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded p-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-xs font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Stock</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete stock for{" "}
                <span className="font-semibold">{deleteConfirm.material?.name || 'N/A'}</span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStock(deleteConfirm)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Stock</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Material *</label>
                <select
                  name="material_id"
                  value={formData.material_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="0">Select Material</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store *</label>
                <select
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="0">Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity on Hand *</label>
                <input
                  type="number"
                  name="qty_on_hand"
                  value={formData.qty_on_hand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter low stock threshold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      material_id: 0,
                      store_id: 0,
                      qty_on_hand: 0,
                      low_stock_threshold: 0,
                    });
                    setFormError('');
                  }}
                  className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? 'Creating...' : 'Create Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Stock</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                <select
                  name="material_id"
                  value={formData.material_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  disabled
                >
                  <option value="0">Select Material</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                <select
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  disabled
                >
                  <option value="0">Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity on Hand *</label>
                <input
                  type="number"
                  name="qty_on_hand"
                  value={formData.qty_on_hand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter low stock threshold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedStock(null);
                    setFormData({
                      material_id: 0,
                      store_id: 0,
                      qty_on_hand: 0,
                      low_stock_threshold: 0,
                    });
                    setFormError('');
                  }}
                  className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showThresholdModal && selectedThresholdStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Set Low Stock Threshold</h3>
            {thresholdFormError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {thresholdFormError}
              </div>
            )}
            <form onSubmit={handleThresholdSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                <p className="text-xs text-gray-900">{selectedThresholdStock.material?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                <p className="text-xs text-gray-900">{selectedThresholdStock.store?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold *</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={thresholdFormData.low_stock_threshold}
                  onChange={handleThresholdInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter low stock threshold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowThresholdModal(false);
                    setSelectedThresholdStock(null);
                    setThresholdFormData({ low_stock_threshold: 0 });
                    setThresholdFormError('');
                  }}
                  className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? 'Updating...' : 'Set Threshold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Stock Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                <p className="text-xs text-gray-900">{selectedStock.material?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                <p className="text-xs text-gray-900">{selectedStock.store?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity on Hand</label>
                <p className="text-xs text-gray-900">{selectedStock.qty_on_hand || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <p className="text-xs text-gray-900">{selectedStock.low_stock_threshold || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <p className="text-xs text-gray-900">{selectedStock.low_stock_alert ? 'Active' : 'Inactive'}</p>
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
            <div className="flex justify-end pt-4">
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

export default StockDashboard;