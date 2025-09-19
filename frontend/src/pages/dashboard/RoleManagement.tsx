import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Shield,
    ShieldPlus,
    MoreHorizontal,
    Users,
    Settings,
    Key,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    X,
    Filter,
    RefreshCw,
    Eye,
    Calendar,
    ChevronDown
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import roleService, { type CreateRoleInput, type UpdateRoleInput } from '../../services/roleService';
import AddRoleModal from '../../components/dashboard/Role/AddRoleModal';
import EditRoleModal from '../../components/dashboard/Role/EditClientModal';
import DeleteRoleModal from '../../components/dashboard/Role/DeleteClientModal';

interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
    created_at: string;
    updated_at: string;
    user_count?: number;
}

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'grid' | 'table' | 'list';

const RoleManagement = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof Role>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            console.log('Fetching roles...');
            try {
                setLoading(true);
                const response = await roleService.getAllRoles();
                console.log('Roles raw response:', response);
                const roles = Array.isArray(response.data?.roles) ? response.data.roles : [];
                setAllRoles(roles);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load roles';
                console.error('Error fetching roles:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, sortBy, sortOrder, allRoles]);

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        const words = name.split(' ');
        return words.length > 1 
            ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
            : name.charAt(0).toUpperCase();
    };

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleFilterAndSort = () => {
        let filtered = [...allRoles];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (role) =>
                    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'created_at' || sortBy === 'updated_at') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setRoles(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `roles_export_${date}.pdf`;

            const tableRows = roles.map((role, index) => {
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">
                            ${getInitials(role.name)}
                        </td>
                        <td style="font-size:10px;">${role.name}</td>
                        <td style="font-size:10px;">${role.description || 'N/A'}</td>
                        <td style="font-size:10px;">${role.user_count || 0}</td>
                    </tr>
                `;
            }).join('');

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
                        tr:nth-child(even) { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Role List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Icon</th>
                                <th>Role Name</th>
                              
                                <th>Users</th>
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

    const handleAddRole = () => {
        setSelectedRole(null);
        setIsAddModalOpen(true);
    };

    const handleEditRole = async (id: number) => {
        try {
            setOperationLoading(true);
            const role = await roleService.getRoleById(id);
            if (role) {
                setSelectedRole(role);
                setIsEditModalOpen(true);
            } else {
                showOperationStatus('error', 'Role not found');
            }
        } catch (err: any) {
            console.error('Error fetching role for edit:', err);
            showOperationStatus('error', err.message || 'Failed to fetch role');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const handleSaveRole = async (data: CreateRoleInput | UpdateRoleInput) => {
        try {
            setOperationLoading(true);
            if (isAddModalOpen) {
                const newRole = await roleService.createRole(data as CreateRoleInput);
                if (!newRole) {
                    throw new Error('No role data returned from createRole');
                }
                setAllRoles((prevRoles) => [...prevRoles, newRole]);
                showOperationStatus('success', `Role ${newRole.name} created successfully`);
                setIsAddModalOpen(false);
            } else {
                if (!selectedRole) {
                    throw new Error('No role selected for update');
                }
                const updatedRole = await roleService.updateRole(selectedRole.id, data as UpdateRoleInput);
                setAllRoles((prevRoles) =>
                    prevRoles.map((r) => (r.id === updatedRole.id ? updatedRole : r))
                );
                showOperationStatus('success', `Role ${updatedRole.name} updated successfully`);
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveRole:', err);
            showOperationStatus('error', err.message || 'Failed to save role');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (role: Role) => {
        try {
            setOperationLoading(true);
            await roleService.deleteRole(role.id);
            setAllRoles((prevRoles) => prevRoles.filter((r) => r.id !== role.id));
            showOperationStatus('success', `Role "${role.name}" deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting role:', err);
            showOperationStatus('error', err.message || 'Failed to delete role');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredRoles = roles;
    const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRoles = filteredRoles.slice(startIndex, endIndex);

    // Summary statistics
    const totalRoles = allRoles.length;
    const newRoles = allRoles.filter((r) => {
        const createdAt = new Date(r.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
    }).length;

    const RoleCard = ({ role }: { role: Role }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        return (
            <div className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                        
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(role.name)} text-white text-xs font-medium`}>
                        {getInitials(role.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">
                            {role.name}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{role.description || 'No description'}</div>
                    </div>
                </div>
              
              
            </div>
        );
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
                                    setSortBy('name');
                                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Role Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                    
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentRoles.map((role, index) => (
                            <tr key={role.id} className="hover:bg-gray-25">
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(role.name)} text-white text-xs font-medium`}>
                                            {getInitials(role.name)}
                                        </div>
                                        <span className="font-medium text-gray-900 text-xs">
                                            {role.name}
                                        </span>
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
            {currentRoles.map((role) => (
                <RoleCard key={role.id} role={role} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentRoles.map((role) => (
                <div key={role.id} className="px-4 py-3 hover:bg-gray-25">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(role.name)} text-white text-sm font-medium`}>
                                {getInitials(role.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    {role.name}
                                </div>
                                <div className="text-gray-500 text-xs truncate">{role.description || 'No description'}</div>
                            </div>
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
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRoles.length)} of {filteredRoles.length}
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
            <AddRoleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveRole}
            />
            <EditRoleModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                role={selectedRole}
                onSave={handleSaveRole}
            />
            <DeleteRoleModal
                isOpen={isDeleteModalOpen}
                role={selectedRole}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
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
            <div className="bg-white shadow-md">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Role Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage your organization's roles and permissions</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => roleService.getAllRoles().then((data: any) => setAllRoles(data?.data?.roles || []))}
                                disabled={loading}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                      
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                aria-label="Export roles"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
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
                                <Shield className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Roles</p>
                                <p className="text-lg font-semibold text-gray-900">{totalRoles}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                                <ShieldPlus className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">New Roles (30d)</p>
                                <p className="text-lg font-semibold text-gray-900">{newRoles}</p>
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
                                    placeholder="Search roles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search roles"
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
                                    const [field, order] = e.target.value.split('-') as [keyof Role, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort roles"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="created_at-desc">Newest First</option>
                                <option value="created_at-asc">Oldest First</option>
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
                                    <Shield className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
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
                            <span className="text-xs">Loading roles...</span>
                        </div>
                    </div>
                ) : currentRoles.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm ? 'No roles found matching your filters' : 'No roles found'}
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
        </div>
    );
};

export default RoleManagement;