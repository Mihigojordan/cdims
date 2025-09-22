
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
  Eye,
} from 'lucide-react';
import stockService, { type Request } from '../../services/stockService';
import siteService, { type Site } from '../../services/siteService';
import html2pdf from 'html2pdf.js';

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const IssuableRequestsDashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Request>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, selectedSite, sortBy, sortOrder, allRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, sitesResponse] = await Promise.all([
        stockService.getIssuableRequests(), // Fetch all requests without pagination
        siteService.getAllSites(),
      ]);
      const fetchedRequests = requestsResponse.requests || [];
      setAllRequests(fetchedRequests);
      setRequests(fetchedRequests);
      setSites(sitesResponse.sites || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load issuable requests';
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
    let filtered = [...allRequests];

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (request) =>
          request.site?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.requestedBy?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply site filter
    if (selectedSite) {
      filtered = filtered.filter((request) => request.site?.name?.toLowerCase() === selectedSite.toLowerCase());
    }

    // Sort requests
    filtered.sort((a, b) => {
      const aValue = sortBy === 'site_id' ? a.site?.name : sortBy === 'requested_by' ? a.requestedBy?.full_name : a[sortBy];
      const bValue = sortBy === 'site_id' ? b.site?.name : sortBy === 'requested_by' ? b.requestedBy?.full_name : b[sortBy];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        const aDate = aValue ? new Date(aValue as string | Date) : new Date(0);
        const bDate = bValue ? new Date(bValue as string | Date) : new Date(0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setRequests(filtered);
    setCurrentPage(1);
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA')?.replace(/\//g, '');
      const filename = `issuable_requests_export_${date}.pdf`;

      const tableRows = requests.map((request, index) => `
        <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
          <td style="font-size:10px;">${request.id}</td>
          <td style="font-size:10px;">${request.site?.name || 'N/A'}</td>
          <td style="font-size:10px;">${request.requestedBy?.full_name || 'N/A'}</td>
          <td style="font-size:10px;">${request.status}</td>
          <td style="font-size:10px;">${request.items?.length || 0}</td>
          <td style="font-size:10px;">${request.items?.reduce((sum, item) => sum + (Number(item.qty_approved) || 0), 0) || 0}</td>
          <td style="font-size:10px;">${new Date(request.created_at || '').toLocaleDateString('en-GB')}</td>
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
          <h1>Issuable Requests Report</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Site</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Total Qty</th>
                <th>Created Date</th>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'ISSUED': return '#3B82F6';
      case 'PARTIALLY_ISSUED': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const totalRequests = allRequests.length;
  const uniqueSites = [...new Set(allRequests.map(request => request.site?.name))].filter(name => name).length;

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">ID</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('site_id');
                  setSortOrder(sortBy === 'site_id' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Site</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'site_id' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('requested_by');
                  setSortOrder(sortBy === 'requested_by' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Requested By</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'requested_by' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Status</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Total Items</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden xl:table-cell">Total Qty</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('created_at');
                  setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'created_at' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{request.id}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{request.site?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{request.requestedBy?.full_name || 'N/A'}</td>
                <td className="py-2 px-2 hidden lg:table-cell">
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={{
                      color: getStatusColor(request.status),
                      backgroundColor: `${getStatusColor(request.status)}20`,
                    }}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{request.items?.length || 0}</td>
                <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">
                  {request.items?.reduce((sum, item) => sum + (Number(item.qty_approved) || 0), 0) || 0}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(request.created_at)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View Request"
                      aria-label="View request details"
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
      {currentRequests.map((request) => (
        <div key={request.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{request.site?.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">{request.requestedBy?.full_name || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getStatusColor(request.status),
                  backgroundColor: `${getStatusColor(request.status)}20`,
                }}
              >
                {request.status}
              </span>
            </div>
            <div className="text-xs text-gray-600">Items: {request.items?.length || 0}</div>
            <div className="text-xs text-gray-600">Qty: {request.items?.reduce((sum, item) => sum + (Number(item.qty_approved) || 0), 0) || 0}</div>
            <div className="text-xs text-gray-600">Date: {formatDate(request.created_at)}</div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleViewRequest(request)}
              className="text-gray-400 hover:text-primary-600 p-1"
              title="View Request"
              aria-label="View request details"
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
      {currentRequests.map((request) => (
        <div key={request.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{request.site?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs truncate">{request.requestedBy?.full_name || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span
                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                style={{
                  color: getStatusColor(request.status),
                  backgroundColor: `${getStatusColor(request.status)}20`,
                }}
              >
                {request.status}
              </span>
              <span>Items: {request.items?.length || 0}</span>
              <span>{formatDate(request.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewRequest(request)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Request"
                aria-label="View request details"
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
          Showing {startIndex + 1}-{Math.min(endIndex, requests.length)} of {requests.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
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
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
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
              <h1 className="text-lg font-semibold text-gray-900">Issuable Requests</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage approved and issuable material requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || requests.length === 0}
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
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold text-gray-900">{totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Sites</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueSites}</p>
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
                  placeholder="Search by site or requester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search issuable requests"
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
                  const [field, order] = e.target.value.split('-') as [keyof Request, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort options"
              >
                <option value="site_id-asc">Site (A-Z)</option>
                <option value="site_id-desc">Site (Z-A)</option>
                <option value="requested_by-asc">Requester (A-Z)</option>
                <option value="requested_by-desc">Requester (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
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
                  <List className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  aria-label="Filter by site"
                >
                  <option value="">All Sites</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.name}>{site.name}</option>
                  ))}
                </select>
                {selectedSite && (
                  <button
                    onClick={() => setSelectedSite('')}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                    aria-label="Clear filters"
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
              <span className="text-xs">Loading issuable requests...</span>
            </div>
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedSite ? 'No issuable requests found matching your criteria' : 'No issuable requests found'}
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

      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Request Details #{selectedRequest.id}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Site</label>
                  <p className="text-xs text-gray-900">{selectedRequest.site?.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Requested By</label>
                  <p className="text-xs text-gray-900">{selectedRequest.requestedBy?.full_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-xs text-gray-900">{selectedRequest.status || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedRequest.updated_at)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-xs text-gray-900">{selectedRequest.notes || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Items</label>
                <div className="bg-gray-50 rounded border border-gray-200 p-2">
                  {selectedRequest.items?.length ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-1 px-2 font-medium">Material</th>
                          <th className="text-left py-1 px-2 font-medium">Qty Requested</th>
                          <th className="text-left py-1 px-2 font-medium">Qty Approved</th>
                          <th className="text-left py-1 px-2 font-medium">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.items.map((item) => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="py-1 px-2">{item.material?.name || '-'}</td>
                            <td className="py-1 px-2">{item.qty_requested || '-'}</td>
                            <td className="py-1 px-2">{item.qty_approved || '-'}</td>
                            <td className="py-1 px-2">{item.material?.unit?.symbol || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-gray-500">No items found</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Approvals</label>
                <div className="bg-gray-50 rounded border border-gray-200 p-2">
                  {selectedRequest.approvals?.length ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-1 px-2 font-medium">Level</th>
                          <th className="text-left py-1 px-2 font-medium">Action</th>
                          <th className="text-left py-1 px-2 font-medium">Reviewer</th>
                          <th className="text-left py-1 px-2 font-medium">Comment</th>
                          <th className="text-left py-1 px-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.approvals.map((approval) => (
                          <tr key={approval.id} className="border-t border-gray-100">
                            <td className="py-1 px-2">{approval.level || '-'}</td>
                            <td className="py-1 px-2">{approval.action || '-'}</td>
                            <td className="py-1 px-2">{approval.reviewer?.full_name || '-'}</td>
                            <td className="py-1 px-2">{approval.comment || '-'}</td>
                            <td className="py-1 px-2">{formatDate(approval.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-gray-500">No approvals found</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                aria-label="Close modal"
              >
                Close
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
  );
};

export default IssuableRequestsDashboard;
