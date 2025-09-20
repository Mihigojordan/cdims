
import React, { useState, useEffect } from 'react';
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
  Plus,
} from 'lucide-react';
import stockService, { type IssuedMaterial, type IssueMaterialPayload, type Request, type Pagination } from '../../services/stockService';
import materialService, { type Material } from '../../services/materialsService';
import storeService, { type Store } from '../../services/storeService';
import html2pdf from 'html2pdf.js';

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface IssueMaterialItem {
  request_item_id: number;
  qty_issued: number;
  checked: boolean;
}

interface IssueMaterialForm {
  request_id: number;
  items: IssueMaterialItem[];
  store_id: number;
  notes: string;
}

const IssuableMaterialsDashboard: React.FC = () => {
  const [issuedMaterials, setIssuedMaterials] = useState<IssuedMaterial[]>([]);
  const [allIssuedMaterials, setAllIssuedMaterials] = useState<IssuedMaterial[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ current_page: 1, total_pages: 1, total_items: 0, items_per_page: 8 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof IssuedMaterial>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('');
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [issueForm, setIssueForm] = useState<IssueMaterialForm>({
    request_id: 0,
    items: [],
    store_id: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, selectedStore, selectedMaterial, selectedMovementType, sortBy, sortOrder, allIssuedMaterials]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsResponse, storesResponse, requestsResponse, issuedMaterialsResponse] = await Promise.all([
        materialService.getAllMaterials(),
        storeService.getAllStores(),
        stockService.getIssuableRequests({ page: 1, limit: 1000 }),
        stockService.getIssuedMaterials({ page: currentPage, limit: itemsPerPage }),
      ]);
      setMaterials(materialsResponse || []);
      setStores(storesResponse.stores || []);
      setRequests(requestsResponse.requests || []);
      setAllIssuedMaterials(issuedMaterialsResponse.issued_materials || []);
      setPagination(issuedMaterialsResponse.pagination || { current_page: 1, total_pages: 1, total_items: 0, items_per_page: 8 });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      showOperationStatus('error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allIssuedMaterials];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (material) =>
          material.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStore) {
      filtered = filtered.filter((material) => material.store?.name?.toLowerCase() === selectedStore.toLowerCase());
    }

    if (selectedMaterial) {
      filtered = filtered.filter((material) => material.material?.name?.toLowerCase() === selectedMaterial.toLowerCase());
    }

    if (selectedMovementType) {
      filtered = filtered.filter((material) => material.movement_type === selectedMovementType);
    }

    filtered.sort((a, b) => {
      const aValue = sortBy === 'material_id' ? a.material?.name : sortBy === 'store_id' ? a.store?.name : a[sortBy];
      const bValue = sortBy === 'material_id' ? b.material?.name : sortBy === 'store_id' ? b.store?.name : b[sortBy];

      if (sortBy === 'created_at') {
        const aDate = aValue ? new Date(aValue as string | Date) : new Date(0);
        const bDate = bValue ? new Date(bValue as string | Date) : new Date(0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(bStr);
    });

    setIssuedMaterials(filtered);
    setCurrentPage(1);
  };

  const handleIssueMaterials = async () => {
    if (!issueForm.request_id || !issueForm.store_id || issueForm.items.every(item => !item.checked)) {
      showOperationStatus('error', 'Please select a request, a store, and at least one item to issue');
      return;
    }

    const invalidItems = issueForm.items.filter(item => item.checked && (item.qty_issued <= 0 || isNaN(item.qty_issued)));
    if (invalidItems.length > 0) {
      showOperationStatus('error', 'Please enter a valid quantity for all selected items');
      return;
    }

    try {
      setOperationLoading(true);
      const payload: IssueMaterialPayload = {
        request_id: issueForm.request_id,
        items: issueForm.items
          .filter(item => item.checked)
          .map(item => ({
            request_item_id: item.request_item_id,
            qty_issued: item.qty_issued,
            store_id: issueForm.store_id,
            notes: issueForm.notes,
          })),
      };
      await stockService.issueMaterials(payload);
      showOperationStatus('success', 'Materials issued successfully');
      setShowIssueModal(false);
      setIssueForm({ request_id: 0, items: [], store_id: 0, notes: '' });
      await loadData();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to issue materials');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA')?.replace(/\//g, '');
      const filename = `issued_materials_export_${date}.pdf`;

      const tableRows = issuedMaterials.map((material, index) => `
        <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
          <td style="font-size:10px;">${index + 1}</td>
          <td style="font-size:10px;">${material.material?.name || 'N/A'}</td>
          <td style="font-size:10px;">${material.store?.name || 'N/A'}</td>
          <td style="font-size:10px;">${material.movement_type}</td>
          <td style="font-size:10px;">${material.qty}</td>
          <td style="font-size:10px;">${material.source_type || '-'}/${material.source_id || '-'}</td>
          <td style="font-size:10px;">${new Date(material.created_at || '').toLocaleDateString('en-GB')}</td>
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
          <h1>Issued Materials Report</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Material</th>
                <th>Store</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Source</th>
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

  const totalIssuedMaterials = allIssuedMaterials.length;
  const uniqueStores = [...new Set(allIssuedMaterials.map(material => material.store?.name))].filter(name => name).length;
  const uniqueMaterials = [...new Set(allIssuedMaterials.map(material => material.material?.name))].filter(name => name).length;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssuedMaterials = issuedMaterials.slice(startIndex, endIndex);

  const selectedRequest = requests.find((req) => req.id === issueForm.request_id);
  const requestItems = selectedRequest?.items || [];

  const handleRequestChange = (requestId: number) => {
    const selectedReq = requests.find(req => req.id === requestId);
    const items = selectedReq?.items.map(item => ({
      request_item_id: item.id,
      qty_issued: item.qty_approved || 0,
      checked: false,
    })) || [];
    setIssueForm({ ...issueForm, request_id: requestId, items });
  };

  const handleItemCheck = (requestItemId: number, checked: boolean) => {
    setIssueForm({
      ...issueForm,
      items: issueForm.items.map(item =>
        item.request_item_id === requestItemId ? { ...item, checked } : item
      ),
    });
  };

  const handleQuantityChange = (requestItemId: number, qty: number) => {
    const selectedItem = requestItems.find(item => item.id === requestItemId);
    const maxQty = selectedItem?.qty_approved || 0;
    const validatedQty = Math.max(0, Math.min(qty, maxQty));
    setIssueForm({
      ...issueForm,
      items: issueForm.items.map(item =>
        item.request_item_id === requestItemId ? { ...item, qty_issued: validatedQty } : item
      ),
    });
  };

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
                  setSortBy('material_id');
                  setSortOrder(sortBy === 'material_id' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Material</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'material_id' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Store</th>
              <th
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
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Quantity</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden xl:table-cell">Source</th>
              <th
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
            {currentIssuedMaterials.map((material, index) => (
              <tr key={material.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{material.material?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{material.store?.name || 'N/A'}</td>
                <td className="py-2 px-2 hidden lg:table-cell">
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={{
                      color: getMovementTypeColor(material.movement_type),
                      backgroundColor: `${getMovementTypeColor(material.movement_type)}20`,
                    }}
                  >
                    {material.movement_type}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{material.qty}</td>
                <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">
                  {material.source_type || '-'}/{material.source_id || '-'}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(material.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentIssuedMaterials.map((material) => (
        <div key={material.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{material.material?.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">{material.store?.name || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getMovementTypeColor(material.movement_type),
                  backgroundColor: `${getMovementTypeColor(material.movement_type)}20`,
                }}
              >
                {material.movement_type}
              </span>
            </div>
            <div className="text-xs text-gray-600">Qty: {material.qty}</div>
            <div className="text-xs text-gray-600">Date: {formatDate(material.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentIssuedMaterials.map((material) => (
        <div key={material.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{material.material?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs truncate">{material.store?.name || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getMovementTypeColor(material.movement_type),
                  backgroundColor: `${getMovementTypeColor(material.movement_type)}20`,
                }}
              >
                {material.movement_type}
              </span>
              <span>Qty: {material.qty}</span>
              <span>{formatDate(material.created_at)}</span>
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
    const endPage = Math.min(pagination.total_pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, issuedMaterials.length)} of {issuedMaterials.length}
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
            disabled={currentPage === pagination.total_pages}
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
              <h1 className="text-lg font-semibold text-gray-900">Issuable Materials</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage issued materials for requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowIssueModal(true)}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
                title="Issue Materials"
              >
                <Plus className="w-3 h-3" />
                <span>Issue Materials</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || issuedMaterials.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Export</span>
              </button>
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Issued Materials</p>
                <p className="text-lg font-semibold text-gray-900">{totalIssuedMaterials}</p>
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
                  const [field, order] = e.target.value.split('-') as [keyof IssuedMaterial, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                  <List className="w-3 h-3" />
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
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
              <span className="text-xs">Loading issued materials...</span>
            </div>
          </div>
        ) : currentIssuedMaterials.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedStore || selectedMaterial || selectedMovementType
                ? 'No issued materials found matching your criteria'
                : 'No issued materials found'}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {pagination.total_pages > 1 && renderPagination()}
          </div>
        )}
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Issue Materials</h3>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setIssueForm({ request_id: 0, items: [], store_id: 0, notes: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Request</label>
                <select
                  value={issueForm.request_id}
                  onChange={(e) => handleRequestChange(Number(e.target.value))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a request</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      #{request.id} - {request.site?.name || 'N/A'} ({request.status})
                    </option>
                  ))}
                </select>
              </div>
              {requestItems.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Requested Items</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {requestItems.map((item) => {
                      const formItem = issueForm.items.find(i => i.request_item_id === item.id);
                      const maxQty = item.qty_approved || 0;
                      return (
                        <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formItem?.checked || false}
                            onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">{item.material?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              Requested: {item.qty_requested} {item.material?.unit?.symbol || ''}, 
                              Approved: {item.qty_approved || 0} {item.material?.unit?.symbol || ''}
                            </p>
                            {formItem?.checked && (
                              <div className="mt-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Issued</label>
                                <input
                                  type="number"
                                  value={formItem.qty_issued}
                                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  min="0"
                                  max={maxQty}
                                  placeholder={`Max ${maxQty}`}
                                />
                                {formItem.qty_issued > maxQty && (
                                  <p className="text-xs text-red-600 mt-1">Cannot exceed approved quantity ({maxQty})</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store</label>
                <select
                  value={issueForm.store_id}
                  onChange={(e) => setIssueForm({ ...issueForm, store_id: Number(e.target.value) })}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setIssueForm({ request_id: 0, items: [], store_id: 0, notes: '' });
                }}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueMaterials}
                disabled={operationLoading}
                className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              >
                Issue
              </button>
            </div>
          </div>
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
    </div>
  );
};

export default IssuableMaterialsDashboard;
