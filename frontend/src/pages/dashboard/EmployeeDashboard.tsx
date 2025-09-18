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
  Store as StoreIcon,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
} from "lucide-react";
import storeService, { type CreateStoreInput, type ValidationResult } from "../../services/storeService";
import { useNavigate } from "react-router-dom";
import type { Store } from "../../types/model";

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const StoreDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Store>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<Store | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<CreateStoreInput>({
    code: '',
    name: '',
    location: '',
    description: '',
    manager_name: '',
    contact_phone: '',
    contact_email: '',
  });
  const [formError, setFormError] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allStores, selectedLocation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { stores } = await storeService.getAllStores();
      setAllStores(stores || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allStores];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (store) =>
          store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(store => store.location?.toLowerCase() === selectedLocation.toLowerCase());
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "created_at" || sortBy === "updated_at") {
        const aDate = typeof aValue === "string" || aValue instanceof Date ? new Date(aValue) : new Date(0);
        const bDate = typeof bValue === "string" || bValue instanceof Date ? new Date(bValue) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      else return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    setStores(filtered);
    setCurrentPage(1);
  };

  const totalStores = allStores.length;
  const uniqueLocations = [...new Set(allStores.map(store => store.location))].length;

  const handleAddStore = () => {
    // Generate sequential store code
    const storeCodes = allStores
      .filter(store => store.code && store.code.startsWith('STORE-'))
      .map(store => {
        const match = store.code.match(/STORE-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    const maxNum = storeCodes.length > 0 ? Math.max(...storeCodes) : 0;
    const nextNum = maxNum + 1;
    const nextCode = `STORE-${nextNum.toString().padStart(4, '0')}`;

    setFormData({
      code: nextCode,
      name: '',
      location: '',
      description: '',
      manager_name: '',
      contact_phone: '',
      contact_email: '',
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validation: ValidationResult = storeService.validateStoreData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    try {
      setOperationLoading(true);
      const newStore = await storeService.createStore(formData);
      setShowAddModal(false);
      setFormData({
        code: '',
        name: '',
        location: '',
        description: '',
        manager_name: '',
        contact_phone: '',
        contact_email: '',
      });
      loadData();
      showOperationStatus("success", `${newStore.name} created successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to create store");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditStore = (store: Store) => {
    if (!store?.id) return;
    setSelectedStore(store);
    setFormData({
      code: store.code || '',
      name: store.name || '',
      location: store.location || '',
      description: store.description || '',
      manager_name: store.manager_name || '',
      contact_phone: store.contact_phone || '',
      contact_email: store.contact_email || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validation: ValidationResult = storeService.validateStoreData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    if (!selectedStore?.id) {
      setFormError("Invalid store ID");
      return;
    }

    try {
      setOperationLoading(true);
      await storeService.updateStore(selectedStore.id, formData);
      setShowUpdateModal(false);
      setSelectedStore(null);
      setFormData({
        code: '',
        name: '',
        location: '',
        description: '',
        manager_name: '',
        contact_phone: '',
        contact_email: '',
      });
      loadData();
      showOperationStatus("success", `${formData.name} updated successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to update store");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewStore = (store: Store) => {
    if (!store?.id) return;
    setSelectedStore(store);
    setShowViewModal(true);
  };

  const handleDeleteStore = async (store: Store) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await storeService.deleteStore(store.id);
      loadData();
      showOperationStatus("success", `${store.name} deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete store");
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

  const totalPages = Math.ceil(stores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStores = stores.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => setSortBy("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "name" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Code</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Manager name</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Location</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Created Date</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentStores.map((store, index) => (
              <tr key={store.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{store.name}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{store.code}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{ store.manager_name ? store.manager_name : "N/A"}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{store.location}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(store.created_at)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewStore(store)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleEditStore(store)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(store)} 
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
      {currentStores.map((store) => (
        <div key={store.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <StoreIcon className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{store.name}</div>
              <div className="text-gray-500 text-xs truncate">{store.code}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{store.location}</span>
            </div>
            {store.contact_email && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Mail className="w-3 h-3" />
                <span className="truncate">{store.contact_email}</span>
              </div>
            )}
            {store.contact_phone && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{store.contact_phone}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewStore(store)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditStore(store)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(store)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentStores.map((store) => (
        <div key={store.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <StoreIcon className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{store.name}</div>
                <div className="text-gray-500 text-xs truncate">{store.code}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-2xl px-4">
              <span className="truncate">{store.location}</span>
              <span className="truncate">{store.contact_email || '-'}</span>
              <span>{formatDate(store.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={() => handleViewStore(store)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="View Store"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditStore(store)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="Edit Store"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteConfirm(store)} 
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" 
                title="Delete Store"
              >
                <Trash2 className="w-4 h-4" />
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
          Showing {startIndex + 1}-{Math.min(endIndex, stores.length)} of {stores.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Store Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your organization's stores</p>
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
              <button
                onClick={handleAddStore}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Store</span>
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
                <StoreIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Stores</p>
                <p className="text-lg font-semibold text-gray-900">{totalStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Locations</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueLocations}</p>
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
                  placeholder="Search stores..."
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
                  const [field, order] = e.target.value.split("-") as [keyof Store, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="code-asc">Code (A-Z)</option>
                <option value="location-asc">Location (A-Z)</option>
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
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Locations</option>
                  {[...new Set(allStores.map(store => store.location))].map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
                {selectedLocation && (
                  <button
                    onClick={() => setSelectedLocation("")}
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
              <span className="text-xs">Loading stores...</span>
            </div>
          </div>
        ) : currentStores.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedLocation ? 'No stores found matching your criteria' : 'No stores found'}
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
                <h3 className="text-sm font-semibold text-gray-900">Delete Store</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.name}</span>
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
                onClick={() => handleDeleteStore(deleteConfirm)}
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
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Store</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store code"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store location"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter manager name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter contact phone"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      code: '',
                      name: '',
                      location: '',
                      description: '',
                      manager_name: '',
                      contact_phone: '',
                      contact_email: '',
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
                  {operationLoading ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Store</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store code"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store location"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter store description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter manager name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter contact phone"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedStore(null);
                    setFormData({
                      code: '',
                      name: '',
                      location: '',
                      description: '',
                      manager_name: '',
                      contact_phone: '',
                      contact_email: '',
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
                  {operationLoading ? 'Updating...' : 'Update Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Store Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Code</label>
                <p className="text-xs text-gray-900">{selectedStore.code || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
                <p className="text-xs text-gray-900">{selectedStore.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <p className="text-xs text-gray-900">{selectedStore.location || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <p className="text-xs text-gray-900">{selectedStore.description || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager Name</label>
                <p className="text-xs text-gray-900">{selectedStore.manager_name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                <p className="text-xs text-gray-900">{selectedStore.contact_email || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <p className="text-xs text-gray-900">{selectedStore.contact_phone || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-xs text-gray-900">{formatDate(selectedStore.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-xs text-gray-900">{formatDate(selectedStore.updated_at)}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStore(null);
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

export default StoreDashboard;