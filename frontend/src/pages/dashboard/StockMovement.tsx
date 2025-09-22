
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  AlignJustify,
} from 'lucide-react';
import stockService, { type StockMovement, type Request, type User, type StockMovementsFilterParams, type Pagination } from '../../services/stockService';
import materialService, { type Material } from '../../services/materialsService';
import storeService, { type Store } from '../../services/storeService';
import html2pdf from 'html2pdf.js';

interface StockMovement {
  id?: number;
  store_id: number;
  material_id: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  source_type: 'GRN' | 'ISSUE' | 'ADJUSTMENT';
  source_id: number;
  qty: number;
  unit_price?: number;
  notes?: string;
  created_by?: number;
  created_at?: Date;
  reference_type?: string;
  reference_id?: number;
  store?: Store;
  material?: Material;
  request?: Request;
  createdBy?: User;
}

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const StockMovementsDashboard: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [allMovements, setAllMovements] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof StockMovement>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8); // Fixed to 8 to match DepartmentDashboard
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('');

  // Debounce search input
  const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }, []);

  const debounceSearch = useCallback(debounce((value: string) => setSearchTerm(value), 300), []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, selectedStore, selectedMaterial, selectedMovementType, sortBy, sortOrder, allMovements]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsResponse, materialsResponse, storesResponse] = await Promise.all([
        stockService.getStockMovements(),
        materialService.getAllMaterials(),
        storeService.getAllStores(),
      ]);

      const fetchedMovements = movementsResponse.movements || [];
      setAllMovements(fetchedMovements);
      setMovements(fetchedMovements);
      setMaterials(materialsResponse || []);
      setStores(storesResponse.stores || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      showOperationStatus('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allMovements];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (movement) =>
          (movement.material?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (movement.store?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStore) {
      filtered = filtered.filter((movement) => (movement.store?.name || '').toLowerCase() === selectedStore.toLowerCase());
    }

    if (selectedMaterial) {
      filtered = filtered.filter((movement) => (movement.material?.name || '').toLowerCase() === selectedMaterial.toLowerCase());
    }

    if (selectedMovementType) {
      filtered = filtered.filter((movement) => movement.movement_type === selectedMovementType);
    }

    filtered.sort((a, b) => {
      const aValue = sortBy === 'material_id' ? (a.material?.name || '') : sortBy === 'store_id' ? (a.store?.name || '') : a[sortBy];
      const bValue = sortBy === 'material_id' ? (b.material?.name || '') : sortBy === 'store_id' ? (b.store?.name || '') : b[sortBy];

      if (sortBy === 'created_at') {
        const aDate = aValue ? new Date(aValue as string | Date) : new Date(0);
        const bDate = bValue ? new Date(bValue as string | Date) : new Date(0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setMovements(filtered);
    setCurrentPage(1); // Reset to first page, matching DepartmentDashboard
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA')?.replace(/\//g, '');
      const filename = `stock_movements_export_${date}.pdf`;

      const tableRows = movements.map((movement, index) => `
        <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
          <td style="font-size:10px;">${index + 1}</td>
          <td style="font-size:10px;">${movement.material?.name || 'N/A'}</td>
          <td style="font-size:10px;">${movement.store?.name || 'N/A'}</td>
          <td style="font-size:10px;">${movement.movement_type}</td>
          <td style="font-size:10px;">${movement.qty}</td>
          <td style="font-size:10px;">${movement.reference_type || '-'}/${movement.reference_id || '-'}</td>
          <td style="font-size:10px;">${new Date(movement.created_at || '').toLocaleDateString('en-GB')}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
            h1 { font-size: 14px; margin-bottom: 5px; }
            p { font-size: 9px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; vertical-align: middle; }
            th { background-color: #2563eb; color: white; font-weight: bold; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Stock Movements Report</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Material</th>
                <th>Store</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const opt = {
        margin: 0.5,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };

      await html2pdf().from(htmlContent).set(opt).save();
      showOperationStatus('success', 'PDF exported successfully');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      showOperationStatus('error', 'Failed to export PDF');
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return '#10B981';
      case 'OUT': return '#EF4444';
      case 'TRANSFER': return '#3B82F6';
      case 'ADJUSTMENT': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const totalMovements = allMovements.length;
  const uniqueStores = [...new Set(allMovements.map(movement => movement.store?.name))].filter(name => name).length;
  const uniqueMaterials = [...new Set(allMovements.map(movement => movement.material?.name))].filter(name => name).length;

  const totalPages = Math.ceil(movements.length / itemsPerPage); // Match DepartmentDashboard
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovements = movements.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th
                scope="col"
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('material_id');
                  setSortOrder(sortBy === 'material_id' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Material</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'material_id' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th scope="col" className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
              <th
                scope="col"
                className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('movement_type');
                  setSortOrder(sortBy === 'movement_type' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'movement_type' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th scope="col" className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Quantity</th>
              <th scope="col" className="text-left py-2 px-2 text-gray-600 font-medium hidden xl:table-cell">Reference</th>
              <th
                scope="col"
                className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('created_at');
                  setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'created_at' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentMovements.map((movement, index) => (
              <tr key={movement.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{movement.material?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{movement.store?.name || 'N/A'}</td>
                <td className="py-2 px-2 hidden lg:table-cell">
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={{
                      color: getMovementTypeColor(movement.movement_type),
                      backgroundColor: `${getMovementTypeColor(movement.movement_type)}20`,
                    }}
                  >
                    {movement.movement_type}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{movement.qty}</td>
                <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">
                  {movement.reference_type || '-'}/{movement.reference_id || '-'}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(movement.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentMovements.map((movement) => (
        <div key={movement.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{movement.material?.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">{movement.store?.name || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getMovementTypeColor(movement.movement_type),
                  backgroundColor: `${getMovementTypeColor(movement.movement_type)}20`,
                }}
              >
                {movement.movement_type}
              </span>
            </div>
            <div className="text-xs text-gray-600">Qty: {movement.qty}</div>
            <div className="text-xs text-gray-600">Date: {formatDate(movement.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentMovements.map((movement) => (
        <div key={movement.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{movement.material?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs truncate">{movement.store?.name || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getMovementTypeColor(movement.movement_type),
                  backgroundColor: `${getMovementTypeColor(movement.movement_type)}20`,
                }}
              >
                {movement.movement_type}
              </span>
              <span>Qty: {movement.qty}</span>
              <span>{formatDate(movement.created_at)}</span>
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
          Showing {startIndex + 1}-{Math.min(endIndex, movements.length)} of {movements.length}
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
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Stock Movements</h1>
              <p className="text-xs text-gray-500 mt-0.5">Track material movements across stores</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || movements.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
                aria-label="Export to PDF"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Movements</p>
                <p className="text-lg font-semibold text-gray-900">{totalMovements}</p>
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
                <p className="text-lg font-semibold text-gray-900">{uniqueStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Materials</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueMaterials}</p>
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
                  placeholder="Search by material or store..."
                  onChange={(e) => debounceSearch(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search stock movements"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [keyof StockMovement, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort options"
              >
                <option value="material_id-asc">Material (A-Z)</option>
                <option value="material_id-desc">Material (Z-A)</option>
                <option value="store_id-asc">Store (A-Z)</option>
                <option value="store_id-desc">Store (Z-A)</option>
                <option value="movement_type-asc">Type (A-Z)</option>
                <option value="movement_type-desc">Type (Z-A)</option>
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
                  aria-label="Table view"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                  aria-label="List view"
                >
                  <AlignJustify className="w-3 h-3" />
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
                  aria-label="Filter by store"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>{store.name}</option>
                  ))}
                </select>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  aria-label="Filter by material"
                >
                  <option value="">All Materials</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.name}>{material.name}</option>
                  ))}
                </select>
                <select
                  value={selectedMovementType}
                  onChange={(e) => setSelectedMovementType(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  aria-label="Filter by movement type"
                >
                  <option value="">All Movement Types</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
                {(selectedStore || selectedMaterial || selectedMovementType) && (
                  <button
                    onClick={() => {
                      setSelectedStore('');
                      setSelectedMaterial('');
                      setSelectedMovementType('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                    aria-label="Clear all filters"
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
              <span className="text-xs">Loading stock movements...</span>
            </div>
          </div>
        ) : currentMovements.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedStore || selectedMaterial || selectedMovementType
                ? 'No stock movements found matching your criteria'
                : 'No stock movements found'}
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
              {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {operationStatus.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
              {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4 text-primary-600" />}
              <span className="font-medium">{operationStatus.message}</span>
              <button onClick={() => setOperationStatus(null)} className="hover:opacity-70" aria-label="Close notification">
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
      </div>
    </div>
  );
};

export default StockMovementsDashboard;