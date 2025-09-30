import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  AlertTriangle,
  Package,
  X,
} from 'lucide-react';
import stockService, { type StockMovement, type Pagination, type Material, type Store } from '../../services/stockService';
import materialService from '../../services/materialsService';
import storeService from '../../services/storeService';

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

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const StockHistory: React.FC = () => {
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StockHistoryFilterParams>({
    page: 1,
    limit: 20,
    store_id: undefined,
    material_id: undefined,
    movement_type: undefined,
    date_from: '',
    date_to: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyResponse, materialsResponse, storesResponse] = await Promise.all([
        stockService.getStockHistory(filters),
        materialService.getAllMaterials(),
        storeService.getAllStores(),
      ]);
      setHistory(historyResponse.history || []);
      setPagination(historyResponse.pagination);
      setMaterials(materialsResponse || []);
      setStores(storesResponse.stores || []);
      setError(null);
      showOperationStatus('success', 'Stock history loaded successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to load stock history');
      showOperationStatus('error', err.message || 'Failed to load stock history');
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof StockHistoryFilterParams
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [field]: field === 'store_id' || field === 'material_id' ? (value ? Number(value) : undefined) : value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const filteredHistory = history.filter((item) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      item.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.store?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const createdAt = item.created_at ? new Date(item.created_at) : null;
    const start = filters.date_from ? new Date(filters.date_from) : null;
    const end = filters.date_to ? new Date(filters.date_to) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const matchesDate =
      !createdAt || (!start && !end) ||
      (start && end && createdAt >= start && createdAt <= end) ||
      (start && !end && createdAt >= start) ||
      (end && !start && createdAt <= end);

    return matchesSearch && matchesDate;
  });

  const formatDate = (date?: Date | string): string => {
    if (!date) return new Date().toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(filteredHistory.length / pagination.items_per_page);
  const startIndex = (filters.page! - 1) * pagination.items_per_page;
  const endIndex = startIndex + pagination.items_per_page;
  const currentHistory = filteredHistory.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, filters.page! - Math.floor(maxVisiblePages / 2));
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
            disabled={filters.page === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setFilters((prev) => ({ ...prev, page }))}
              className={`px-2 py-1 text-xs rounded ${
                filters.page === page
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
            disabled={filters.page === totalPages}
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Stock History Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">View and filter stock movement history</p>
            </div>
            <div>
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
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={handleSearch}
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
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                  <select
                    value={filters.store_id || ''}
                    onChange={(e) => handleFilterChange(e, 'store_id')}
                    className="w-full sm:w-40 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Stores</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                  <select
                    value={filters.material_id || ''}
                    onChange={(e) => handleFilterChange(e, 'material_id')}
                    className="w-full sm:w-40 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Materials</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Movement Type</label>
                  <select
                    value={filters.movement_type || ''}
                    onChange={(e) => handleFilterChange(e, 'movement_type')}
                    className="w-full sm:w-40 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All Movement Types</option>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange(e, 'date_from')}
                    className="w-full sm:w-40 px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange(e, 'date_to')}
                    className="w-full sm:w-40 px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                {(filters.date_from || filters.date_to) && (
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        date_from: '',
                        date_to: '',
                        page: 1,
                      }))
                    }
                    className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    Clear Dates
                  </button>
                )}
                {(filters.store_id || filters.material_id || filters.movement_type || filters.date_from || filters.date_to) && (
                  <button
                    onClick={() =>
                      setFilters({
                        page: 1,
                        limit: 20,
                        store_id: undefined,
                        material_id: undefined,
                        movement_type: undefined,
                        date_from: '',
                        date_to: '',
                      })
                    }
                    className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    Clear All Filters
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
              <span className="text-xs">Loading stock history...</span>
            </div>
          </div>
        ) : currentHistory.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || filters.store_id || filters.material_id || filters.movement_type || filters.date_from || filters.date_to
                ? 'No stock history found matching your criteria'
                : 'No stock history available'}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Material</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Movement Type</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty Before</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty Change</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty After</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Notes</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Created By</th>
                      <th className="text-left py-2 px-2 text-gray-600 font-medium">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentHistory.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-25">
                        <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                        <td className="py-2 px-2 font-medium text-gray-900 text-xs">{item.material?.name || 'N/A'}</td>
                        <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{item.store?.name || 'N/A'}</td>
                        <td className="py-2 px-2 text-gray-700">{item.movement_type}</td>
                        <td className="py-2 px-2 text-gray-700">{Number(item.qty_before) || 0}</td>
                        <td className="py-2 px-2 text-gray-700">{Number(item.qty_change) || 0}</td>
                        <td className="py-2 px-2 text-gray-700">{Number(item.qty_after) || 0}</td>
                        <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{item.notes || '-'}</td>
                        <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{item.createdBy?.full_name || '-'}</td>
                        <td className="py-2 px-2 text-gray-700">{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && renderPagination()}
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
              operationStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : operationStatus.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-primary-50 border border-primary-200 text-primary-800'
            }`}
          >
            {operationStatus.type === 'success' && <Package className="w-4 h-4 text-green-600" />}
            {operationStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === 'info' && <AlertTriangle className="w-4 h-4 text-primary-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;