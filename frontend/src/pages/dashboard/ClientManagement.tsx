/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Users,
    UserCheck,
    UserX,
    UserPlus,
    MoreHorizontal,
    MessageSquare,
    Phone,
    Mail,
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
    ChevronDown,
    UserSquare
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import userService, { type CreateUserInput, type UpdateUserInput } from '../../services/userService';
import AddUserModal from '../../components/dashboard/client/AddClientModal';
import EditUserModal from '../../components/dashboard/client/EditClientModal';
import DeleteUserModal from '../../components/dashboard/client/DeleteClientModal';
import { formatRole } from '../../utils/dateUtils';

interface User {
    role_name: any;
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role_id: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState<keyof User>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();

      // Log the response to see structure
      console.log('Fetched users:', response);

      // Extract users safely
      const users = Array.isArray(response?.data?.users) ? response.data.users : [];

      setAllUsers(users);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
      showOperationStatus('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);



    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, statusFilter, sortBy, sortOrder, allUsers]);

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (full_name: string) => {
        const names = full_name.split(' ');
        return names.length > 1 
            ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
            : full_name.charAt(0).toUpperCase();
    };

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleFilterAndSort = () => {
        let filtered = [...allUsers];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (user) =>
                    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((user) => user.active === (statusFilter === 'true'));
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setUsers(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `users_export_${date}.pdf`;

            const tableRows = users.map((user, index) => {
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">
                            ${getInitials(user.full_name)}
                        </td>
                        <td style="font-size:10px;">${user.email}</td>
                        <td style="font-size:10px;">${user.phone || 'N/A'}</td>
                        <td style="font-size:10px;">${user.role_name}</td>
                        <td style="font-size:10px; color: ${user.active ? 'green' : 'red'};">
                            ${user.active ? 'ACTIVE' : 'INACTIVE'}
                        </td>
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
                    <h1>User List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                               
                                <th>Status</th>
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

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsAddModalOpen(true);
    };

    const handleEditUser = async (user) => {

               setOperationLoading(true);
     
            if (user) {
                setSelectedUser(user);
                setIsEditModalOpen(true);
            } else {
                showOperationStatus('error', 'User not found');
            }
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleSaveUser = async (data: CreateUserInput | UpdateUserInput) => {
        try {
            setOperationLoading(true);
            if (isAddModalOpen) {
                const newUser = await userService.createUser(data as CreateUserInput);
               
                
                if (!newUser) {
                    throw new Error('No user data returned from createUser');
                }
                setAllUsers((prevUsers) => [...prevUsers, newUser]);
                showOperationStatus('success', `User ${newUser.full_name} created successfully`);
                setIsAddModalOpen(false);
            } else {
                if (!selectedUser) {
                    throw new Error('No user selected for update');
                }
                const updatedUser = await userService.updateUser(selectedUser.id, data as UpdateUserInput);
                setAllUsers((prevUsers) =>
                    prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
                );
                showOperationStatus('success', `User ${updatedUser.full_name} updated successfully`);
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveUser:', err);
            showOperationStatus('error', err.message || 'Failed to save user');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (user: User) => {

        console.log("dsjfgdsj")
        try {

            setOperationLoading(true);
            await userService.deleteUser(user.id);
            setAllUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
            showOperationStatus('success', `User "${user.full_name}" deleted successfully`);


        } catch (err: any) {
            console.error('Error deleting user:', err);
            showOperationStatus('error', err.message || 'Failed to delete user');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusText = (active: boolean) => active ? 'ACTIVE' : 'INACTIVE';

    const filteredUsers = users;
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Summary statistics
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.active).length;
    const inactiveUsers = allUsers.filter((u) => !u.active).length;
    const newUsers = allUsers.filter((u) => {
        const createdAt = new Date(u.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
    }).length;

    const UserCard = ({ user }: { user: User }) => {
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
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-6 bg-white shadow-lg rounded border py-1 z-10">
                                <button
                                    onClick={() => {
                                        handleViewUser(user);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        handleEditUser(user);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteUser(user);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(user.full_name)} text-white text-xs font-medium`}>
                        {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">
                            {user.full_name}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{user.email}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <UserSquare className="w-3 h-3" />
                        <span>{formatRole(user) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(user.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        • {getStatusText(user.active)}
                    </span>
                    <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Message">
                            <MessageSquare className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Call">
                            <Phone className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Email">
                            <Mail className="w-3 h-3" />
                        </button>
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
                                    setSortBy('full_name');
                                    setSortOrder(sortBy === 'full_name' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'full_name' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Email</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Phone</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Role</th>
                         <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentUsers.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-25">
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(user.full_name)} text-white text-xs font-medium`}>
                                            {getInitials(user.full_name)}
                                        </div>
                                        <span className="font-medium text-gray-900 text-xs">
                                            {user.full_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{user.email}</td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{user.phone || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatRole(user) || 'N/A'}</td>
                         <td className="py-2 px-2">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        • {getStatusText(user.active)}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                                            title="Edit"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
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
            {currentUsers.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentUsers.map((user) => (
                <div key={user.id} className="px-4 py-3 hover:bg-gray-25">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(user.full_name)} text-white text-sm font-medium`}>
                                {getInitials(user.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    {user.full_name}
                                </div>
                                <div className="text-gray-500 text-xs truncate">{user.email}</div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span className="">{formatRole(user) || 'N/A'}</span>
                           
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span className="truncate">{user.phone || 'N/A'}</span>
                            <span>{formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewUser(user)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View User"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEditUser(user.id)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                                title="Edit User"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete User"
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
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
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
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveUser}
            />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                user={selectedUser}
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
                            <h1 className="text-lg font-semibold text-gray-900">User Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage your organization's users</p>
                        </div>
                        <div className="flex items-center space-x-2">
                        
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || filteredUsers.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                aria-label="Add new user"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add User</span>
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
                                <Users className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Users</p>
                                <p className="text-lg font-semibold text-gray-900">{totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Active Users</p>
                                <p className="text-lg font-semibold text-gray-900">{activeUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                                <UserX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Inactive Users</p>
                                <p className="text-lg font-semibold text-gray-900">{inactiveUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">New Users (30d)</p>
                                <p className="text-lg font-semibold text-gray-900">{newUsers}</p>
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
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search users"
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
                                    const [field, order] = e.target.value.split('-') as [keyof User, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort users"
                            >
                                <option value="full_name-asc">Name (A-Z)</option>
                                <option value="full_name-desc">Name (Z-A)</option>
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
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
                                    <Users className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
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
                            <span className="text-xs">Loading users...</span>
                        </div>
                    </div>
                ) : currentUsers.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm || statusFilter !== 'all' ? 'No users found matching your filters' : 'No users found'}
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
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">User Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close view modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                                    {selectedUser.full_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedUser.phone || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{getStatusText(selectedUser.active)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedUser.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Last Updated</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedUser.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;