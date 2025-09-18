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
  Users as UsersIcon,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
} from "lucide-react";
import siteAssignmentService, { type CreateSiteAssignmentInput, type ValidationResult, type SiteAssignment } from "../../services/siteAssignmentService";
import userService, { type User } from "../../services/userService";
import siteService, { type Site } from "../../services/siteService";
import  useAuth  from "../../context/AuthContext"; // Assuming this provides current user
import { useNavigate } from "react-router-dom";

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const SiteAssignmentDashboard: React.FC = () => {
 
  const [assignments, setAssignments] = useState<SiteAssignment[]>([]);
  const [allAssignments, setAllAssignments] = useState<SiteAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof SiteAssignment>("assigned_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<SiteAssignment | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<SiteAssignment | null>(null);
  const [formData, setFormData] = useState<CreateSiteAssignmentInput>({
    site_id: 0,
    user_id: 0,
  });
  const [formError, setFormError] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allAssignments]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentRes, userRes, siteRes] = await Promise.all([
        siteAssignmentService.getAllSiteAssignments({}), // Get all without pagination
        userService.getAllUsers(),
        siteService.getAllSites({}), // Get all without pagination
      ]);
      console.log('assing:',assignmentRes.assignments);
      
      setAllAssignments(assignmentRes.assignments || []);
      setUsers(userRes?.data?.users || []);
      setSites(siteRes.sites || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allAssignments];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.site?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.assignedBy?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "assigned_at") {
        const aDate = typeof aValue === "string" || aValue instanceof Date ? new Date(aValue) : new Date(0);
        const bDate = typeof bValue === "string" || bValue instanceof Date ? new Date(bValue) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      else return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    setAssignments(filtered);
    setCurrentPage(1);
  };

  const totalAssignments = allAssignments.length;

  const handleAddAssignment = () => {
    setFormData({
      site_id: 0,
      user_id: 0,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

   
    const validation: ValidationResult = siteAssignmentService.validateSiteAssignmentData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    try {
      setOperationLoading(true);
      const newAssignment = await siteAssignmentService.assignSiteToUser({
        ...formData,
      
      });
      setShowAddModal(false);
      setFormData({
        site_id: 0,
        user_id: 0,
      });
      loadData();
      showOperationStatus("success", `Site assigned successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to assign site");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditAssignment = (assignment: SiteAssignment) => {
    if (!assignment?.id) return;
    setSelectedAssignment(assignment);
    setFormData({
      site_id: assignment.site_id,
      user_id: assignment.user_id,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedAssignment?.id) {
      setFormError("Invalid assignment ID");
      return;
    }

    try {
      setOperationLoading(true);
      await siteAssignmentService.updateSiteAssignment(selectedAssignment.id, formData);
      setShowUpdateModal(false);
      setSelectedAssignment(null);
      setFormData({
        site_id: 0,
        user_id: 0,
      });
      loadData();
      showOperationStatus("success", `Assignment updated successfully!`);
    } catch (err: any) {
      setFormError(err.message || "Failed to update assignment");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewAssignment = (assignment: SiteAssignment) => {
    if (!assignment?.id) return;
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleDeleteAssignment = async (assignment: SiteAssignment) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await siteAssignmentService.removeSiteAssignment(assignment.id);
      loadData();
      showOperationStatus("success", `Assignment removed successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to remove assignment");
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

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = assignments.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => setSortBy("assigned_at")}
              >
                <div className="flex items-center space-x-1">
                  <span>Assigned Date</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "assigned_at" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Site</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">User</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Assigned By</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Status</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentAssignments.map((assignment, index) => (
              <tr key={assignment.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{formatDate(assignment.assigned_at)}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{assignment.site?.name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{assignment.user?.full_name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{assignment.assignedBy?.full_name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    assignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewAssignment(assignment)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleEditAssignment(assignment)} 
                      className="text-gray-400 hover:text-primary-600 p-1" 
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(assignment)} 
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
      {currentAssignments.map((assignment) => (
        <div key={assignment.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{assignment.site?.name || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">{assignment.user?.full_name || 'N/A'}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span>Status: </span>
              <span className={`px-1 rounded ${
                assignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {assignment.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 truncate">{formatDate(assignment.assigned_at)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewAssignment(assignment)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditAssignment(assignment)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(assignment)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentAssignments.map((assignment) => (
        <div key={assignment.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{assignment.site?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs truncate">{assignment.user?.full_name || 'N/A'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-2xl px-4">
              <span className="truncate">{assignment.assignedBy?.full_name || 'N/A'}</span>
              <span className={`px-2 py-0.5 rounded ${
                assignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {assignment.status}
              </span>
              <span>{formatDate(assignment.assigned_at)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={() => handleViewAssignment(assignment)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="View Assignment"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditAssignment(assignment)} 
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
                title="Edit Assignment"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteConfirm(assignment)} 
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" 
                title="Delete Assignment"
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
          Showing {startIndex + 1}-{Math.min(endIndex, assignments.length)} of {assignments.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Site Assignment Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage site assignments for users</p>
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
                onClick={handleAddAssignment}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Assign Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Assignments</p>
                <p className="text-lg font-semibold text-gray-900">{totalAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assignments..."
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
                  const [field, order] = e.target.value.split("-") as [keyof SiteAssignment, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="assigned_at-desc">Newest</option>
                <option value="assigned_at-asc">Oldest</option>
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
              <span className="text-xs">Loading assignments...</span>
            </div>
          </div>
        ) : currentAssignments.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm ? 'No assignments found matching your criteria' : 'No assignments found'}
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
                <h3 className="text-sm font-semibold text-gray-900">Delete Assignment</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to remove the assignment for{" "}
                <span className="font-semibold">{deleteConfirm.user?.full_name}</span> at{" "}
                <span className="font-semibold">{deleteConfirm.site?.name}</span>
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
                onClick={() => handleDeleteAssignment(deleteConfirm)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Assign Site to User</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site *</label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User *</label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      site_id: 0,
                      user_id: 0,
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
                  {operationLoading ? 'Assigning...' : 'Assign Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Assignment</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site</label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User</label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={0}>Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedAssignment(null);
                    setFormData({
                      site_id: 0,
                      user_id: 0,
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
                  {operationLoading ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Assignment Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site</label>
                <p className="text-xs text-gray-900">{selectedAssignment.site?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User</label>
                <p className="text-xs text-gray-900">{selectedAssignment.user?.full_name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned By</label>
                <p className="text-xs text-gray-900">{selectedAssignment.assignedBy?.full_name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned At</label>
                <p className="text-xs text-gray-900">{formatDate(selectedAssignment.assigned_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <p className="text-xs text-gray-900">
                  <span className={`px-2 py-1 rounded-full ${
                    selectedAssignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedAssignment.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssignment(null);
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

export default SiteAssignmentDashboard;