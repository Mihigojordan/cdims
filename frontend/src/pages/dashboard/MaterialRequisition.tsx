/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Download,
    LayoutGrid,
    List,
    Filter,
    RefreshCw,
    Eye,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Package,
    Truck,
    CheckSquare,
    Clock,
    AlertTriangle,
    Edit,
    Check,
    Upload,
    UserCheck,
    Archive,
    Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import requisitionService, {
    type MaterialRequisition,
    type CreateRequisitionInput,
    type UpdateRequisitionInput,
    type ReceiveMaterialItem,
    type ReceiveMaterialsResponse
} from '../../services/requestService';
import AddRequisitionModal from '../../components/dashboard/MaterialRequest/AddClientModal';
import EditRequisitionModal from '../../components/dashboard/MaterialRequest/EditClientModal';
import DeleteRequisitionModal from '../../components/dashboard/MaterialRequest/EditClientModal';
import ViewRequisitionModal from '../../components/dashboard/MaterialRequest/EditClientModal';
import ApproveRequisitionModal from '../../components/dashboard/request/ApproveRequisitionModal';
import RejectRequisitionModal from '../../components/dashboard/request/RejectRequisitionModal';
import ReceiveMaterialsModal from '../../components/dashboard/request/ReceiveMaterialsModal';
import ModifyRequisitionModal from '../../components/dashboard/request/ModifyRequisitionModal';
import useAuth from '../../context/AuthContext';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

interface RequisitionItem {
    id: number;
    material_id: number;
    unit_id: number;
    qty_requested: number;
    qty_approved?: number;
    qty_issued?: number;
    qty_received?: number;
    received_at?: string;
    received_by?: number;
    material: {
        id: number;
        name: string;
        description: string;
        code: string;
        specifications: string;
        unit_price: number;
        category: {
            id: number;
            name: string;
        };
        unit?: {
            id: number;
            name: string;
            symbol?: string;
        };
    };
}

interface MaterialRequisition {
    id: number;
    site_id: number;
    notes: string;
    items: RequisitionItem[];
    site?: { name: string };
    requestedBy?: { full_name: string };
    status: string;
    created_at: string;
    approvals?: {
        id: number;
        level: 'DSE' | 'MANAGER' | 'DIRECTOR' | 'PADIRI';
        action: 'APPROVED' | 'REJECTED' | 'PENDING' | 'MODIFIED';
        reviewer: {
            id: number;
            full_name: string;
            role: { id: number; name: string };
        };
    }[];
}

interface ApproveRequisitionResponse {
    success: boolean;
    data: { request: MaterialRequisition };
    message: string;
}

const RequisitionManagement = () => {
    const [requisitions, setRequisitions] = useState<MaterialRequisition[]>([]);
    const [allRequisitions, setAllRequisitions] = useState<MaterialRequisition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState<string>(''); // New state for start date
    const [dateTo, setDateTo] = useState<string>(''); // New state for end date
    const [sortBy, setSortBy] = useState<keyof MaterialRequisition>('site_id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [itemsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
    const [selectedRequisition, setSelectedRequisition] = useState<MaterialRequisition | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const { user } = useAuth();

    const isSiteEngineer = user?.role.name === 'SITE_ENGINEER';
    const canModify = ['ADMIN', 'DIOCESAN_SITE_ENGINEER', 'PADIRI'].includes(user?.role.name);

    useEffect(() => {
        const fetchRequisitions = async () => {
            if (!user) return;
            try {
                setLoading(true);
                let response;
                if (user?.role.name === 'SITE_ENGINEER') {
                    response = await requisitionService.getAllMyRequisitions();
                } else {
                    response = await requisitionService.getAllRequisitions();
                }
                const requisitions = Array.isArray(response?.data?.requests)
                    ? response.data.requests
                    : [];
                setAllRequisitions(requisitions);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || "Failed to load requisitions";
                setError(errorMessage);
                showOperationStatus("error", errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchRequisitions();
    }, [user]);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, statusFilter, dateFrom, dateTo, sortBy, sortOrder, allRequisitions]);

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFilterAndSort = () => {
        let filtered = [...allRequisitions];

        // Apply search term filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (requisition) =>
                    requisition.site?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    requisition.requestedBy?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    requisition.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    requisition?.id?.toString()?.includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((requisition) => requisition.status === statusFilter);
        }

        // Apply date range filter
        if (dateFrom || dateTo) {
            filtered = filtered.filter((requisition) => {
                const createdAt = new Date(requisition.created_at).getTime();
                const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : -Infinity;
                const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : Infinity;
                return createdAt >= from && createdAt <= to;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy] ?? '';
            let bValue: any = b[sortBy] ?? '';

            if (sortBy === 'site_id') {
                aValue = a.site?.name ?? '';
                bValue = b.site?.name ?? '';
            } else if (sortBy === 'requestedBy') {
                aValue = a.requestedBy?.full_name ?? '';
                bValue = b.requestedBy?.full_name ?? '';
            } else if (sortBy === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const strA = aValue?.toString()?.toLowerCase();
            const strB = bValue?.toString()?.toLowerCase();
            return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });

        setRequisitions(filtered);
        setCurrentPage(1);
    };

    const handleClearDates = () => {
        setDateFrom('');
        setDateTo('');
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA')?.replace(/\//g, '');
            const filename = `requisitions_export_${date}.pdf`;

            const tableRows = requisitions.map((requisition, index) => {
                const totalQuantity = requisition.items?.reduce((sum, item) => sum + item.qty_requested, 0) || 0;
                return `
                    <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${requisition.id}</td>
                        <td style="font-size:10px;">${requisition.site?.name || 'N/A'}</td>
                        <td style="font-size:10px;">${requisition.requestedBy?.full_name || 'N/A'}</td>
                        <td style="font-size:10px;">${totalQuantity}</td>
                        ${!isSiteEngineer ? `<td style="font-size:10px;">${formatDate(requisition.created_at)}</td>` : ''}
                        <td style="font-size:10px; color: ${getStatusColor(requisition.status)};">
                            ${requisition.status}
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
                    </style>
                </head>
                <body>
                    <h1>Material Requisition List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Req ID</th>
                                <th>Site</th>
                                <th>Requested By</th>
                                <th>Quantity</th>
                                ${!isSiteEngineer ? '<th>Created At</th>' : ''}
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

    const handleAddRequisition = () => {
        setSelectedRequisition(null);
        setIsAddModalOpen(true);
    };

    const handleEditRequisition = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsEditModalOpen(true);
    };

    const handleModifyRequisition = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsModifyModalOpen(true);
    };

    const handleApproveRequisition = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsApproveModalOpen(true);
    };

    const handleRejectRequisition = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsRejectModalOpen(true);
    };

    const handleReceiveMaterials = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsReceiveModalOpen(true);
    };

    const IssueMaterialPage = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsViewModalOpen(true);
    };

    const handleDeleteRequisition = (requisition: MaterialRequisition) => {
        setSelectedRequisition(requisition);
        setIsDeleteModalOpen(true);
    };

    const handleReceiveSuccess = (response: ReceiveMaterialsResponse) => {
        setAllRequisitions((prev) =>
            prev.map((r) =>
                r.id === response.data.request_id
                    ? {
                          ...r,
                          status: response.data.all_items_received ? 'CLOSED' : 'RECEIVED',
                          items: r.items.map((item) => {
                              const receivedItem = response.data.received_items.find(
                                  (ri) => ri.request_item_id === item.id
                              );
                              return receivedItem
                                  ? {
                                        ...item,
                                        qty_received: receivedItem.total_received,
                                        received_at: new Date().toISOString(),
                                        received_by: user?.id
                                    }
                                  : item;
                          })
                      }
                    : r
            )
        );
        showOperationStatus('success', `Materials for requisition #${response.data.request_id} received successfully`);
        setIsReceiveModalOpen(false);
        setSelectedRequisition(null);
    };

    const handleModifySuccess = (response: any) => {
        setAllRequisitions((prev) =>
            prev.map((r) =>
                r.id === response.data.request.id
                    ? {
                          ...response.data.request,
                          status: response.data.request.status,
                          approvals: [
                              ...(r.approvals || []),
                              {
                                  id: Date.now(), // Temporary ID, replace with actual ID if provided
                                  level: user?.role.name === 'DIOCESAN_SITE_ENGINEER' ? 'DSE' : user?.role.name,
                                  action: 'MODIFIED',
                                  reviewer: {
                                      id: user?.id || 0,
                                      full_name: user?.full_name || 'Unknown',
                                      role: { id: user?.role.id || 0, name: user?.role.name || 'Unknown' }
                                  }
                              }
                          ]
                      }
                    : r
            )
        );
        showOperationStatus('success', `Requisition #${response.data.request.id} modified successfully`);
        setIsModifyModalOpen(false);
        setSelectedRequisition(null);
    };

    const handleSaveRequisition = async (data: CreateRequisitionInput | UpdateRequisitionInput) => {
        try {
            setOperationLoading(true);
            if (isAddModalOpen) {
                const newRequisition = await requisitionService.createRequisition(data as CreateRequisitionInput);
                if (!newRequisition) {
                    throw new Error('No requisition data returned from createRequisition');
                }
                setAllRequisitions((prevRequisitions) => [...prevRequisitions, newRequisition]);
                showOperationStatus('success', `Requisition #${newRequisition.id} created successfully`);
                setIsAddModalOpen(false);
            } else {
                if (!selectedRequisition) {
                    throw new Error('No requisition selected for update');
                }
                const updatedRequisition = await requisitionService.updateRequisition(
                    selectedRequisition?.id?.toString(),
                    data as UpdateRequisitionInput
                );
                setAllRequisitions((prevRequisitions) =>
                    prevRequisitions.map((r) => (r.id === updatedRequisition.id ? updatedRequisition : r))
                );
                showOperationStatus('success', `Requisition #${updatedRequisition.id} updated successfully`);
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveRequisition:', err);
            showOperationStatus('error', err.message || 'Failed to save requisition');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (requisition: MaterialRequisition) => {
        try {
            setOperationLoading(true);
            await requisitionService.deleteRequisition(requisition.id?.toString());
            setAllRequisitions((prevRequisitions) => prevRequisitions.filter((r) => r.id !== requisition.id));
            showOperationStatus('success', `Requisition #${requisition.id} deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting requisition:', err);
            showOperationStatus('error', err.message || 'Failed to delete requisition');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedRequisition(null);
        }
    };

    const handleApproveSuccess = (response: ApproveRequisitionResponse) => {
        const updatedRequisition = response.data.request;
        setAllRequisitions((prevRequisitions:any) =>
            prevRequisitions.map((r:any) =>
                r.id === updatedRequisition.id
                    ? {
                          ...updatedRequisition,
                          approvals: [
                              ...(r.approvals || []),
                              {
                                  id: Date.now(), // Temporary ID, replace with actual ID if provided
                                  level: user?.role.name === 'DIOCESAN_SITE_ENGINEER' ? 'DSE' : user?.role.name,
                                  action: 'APPROVED',
                                  reviewer: {
                                      id: user?.id || 0,
                                      full_name: user?.full_name || 'Unknown',
                                      role: { id: user?.role.id || 0, name: user?.role.name || 'Unknown' }
                                  }
                              }
                          ]
                      }
                    : r
            )
        );
        showOperationStatus('success', `Requisition #${updatedRequisition.id} ${updatedRequisition.status.toLowerCase()} successfully`);
        setIsApproveModalOpen(false);
        setSelectedRequisition(null);
    };

    const handleRejectSuccess = (updatedRequisition: MaterialRequisition) => {
        setAllRequisitions((prevRequisitions) =>
            prevRequisitions.map((r) => (r.id === updatedRequisition.id ? updatedRequisition : r))
        );
        showOperationStatus('success', `Requisition #${updatedRequisition.id} rejected successfully`);
        setIsRejectModalOpen(false);
        setSelectedRequisition(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#F59E0B'; // amber
            case 'SUBMITTED': return '#3B82F6'; // blue
            case 'DSE_REVIEW': return '#8B5CF6'; // purple
            case 'VERIFIED': return '#06B6D4'; // cyan
            case 'APPROVED': return '#10B981'; // green
            case 'PARTIALLY_ISSUED': return '#EAB308'; // yellow
            case 'ISSUED': return '#2563EB'; // darker blue
            case 'REJECTED': return '#EF4444'; // red
            case 'RECEIVED': return '#059669'; // darker green
            case 'CLOSED': return '#6B7280'; // gray
            default: return '#6B7280'; // fallback gray
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-3 h-3" />;
            case 'SUBMITTED': return <Upload className="w-3 h-3" />;
            case 'DSE_REVIEW': return <Search className="w-3 h-3" />;
            case 'VERIFIED': return <UserCheck className="w-3 h-3" />;
            case 'APPROVED': return <CheckCircle className="w-3 h-3" />;
            case 'PARTIALLY_ISSUED': return <AlertTriangle className="w-3 h-3" />;
            case 'ISSUED': return <Truck className="w-3 h-3" />;
            case 'REJECTED': return <XCircle className="w-3 h-3" />;
            case 'RECEIVED': return <CheckSquare className="w-3 h-3" />;
            case 'CLOSED': return <Archive className="w-3 h-3" />;
            default: return <Package className="w-3 h-3" />;
        }
    };

    const renderActionButtonBasedOnUser = (user: any, requisition: any) => {
        const status = requisition?.status;

        if ([ 'REJECTED', 'CLOSED', 'RECEIVED'].includes(status)) {
            return null;
        }

        const actionButtons = [];

        if (user?.role.name === 'SITE_ENGINEER' && ['PENDING', 'SUBMITTED'].includes(status)) {
            actionButtons.push(
                <button
                    key="edit"
                    onClick={() => handleEditRequisition(requisition)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                    title="Edit Requisition"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            );
        }

        if (user?.role.name === 'SITE_ENGINEER' && ['ISSUED', 'PARTIALLY_ISSUED'].includes(status)) {
            actionButtons.push(
                <button
                    key="receive"
                    onClick={() => handleReceiveMaterials(requisition)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
                    title="Receive Materials"
                >
                    <CheckSquare className="w-4 h-4" />
                </button>
            );
        }

        if (
            canModify &&
            (
                (user?.role.name === 'DIOCESAN_SITE_ENGINEER' && status === 'VERIFIED') ||
                (['ADMIN', 'PADIRI'].includes(user?.role.name) && status === 'APPROVED')
            )
        ) {
            actionButtons.push(
                <button
                    key="modify"
                    onClick={() => handleModifyRequisition(requisition)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                    title="Modify Requisition"
                >
                    <Edit className="w-4 h-4" />
                </button>
            );
        }

        if (
            ['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER'].includes(user?.role.name) &&
            ['PENDING', 'SUBMITTED', 'DSE_REVIEW', 'VERIFIED'].includes(status) &&
            !(user?.role.name === 'DIOCESAN_SITE_ENGINEER')
          
        ) {
            actionButtons.push(
                <div key="approve-reject" className="flex items-center space-x-1">
                    <button
                        onClick={() => handleApproveRequisition(requisition)}
                        disabled={operationLoading}
                        className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                        title="Approve Requisition"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleRejectRequisition(requisition)}
                        disabled={operationLoading}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Reject Requisition"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            );
        }

        return actionButtons.length > 0 ? (
            <div className="flex items-center space-x-1">{actionButtons}</div>
        ) : null;
    };

    const totalPages = Math.ceil(requisitions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequisitions = requisitions.slice(startIndex, endIndex);

    const totalRequisitions = allRequisitions.length;
    const draftRequisitions = allRequisitions.filter((r) => r.status === 'DRAFT').length;
    const pendingRequisitions = allRequisitions.filter((r) => r.status === 'PENDING').length;
    const approvedRequisitions = allRequisitions.filter((r) => r.status === 'APPROVED').length;

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
                                    setSortBy('site_id');
                                    setSortOrder(sortBy === 'site_id' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Site</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'site_id' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Requested By</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Items</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('created_at');
                                    setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created At</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'created_at' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentRequisitions.map((requisition, index) => (
                            <tr
                                key={requisition.id}
                                className={`hover:bg-gray-25 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                            >
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2 text-gray-700">{requisition.site?.name || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{requisition.requestedBy?.full_name || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{`${requisition.items.length} items` || 'N/A'}</td>
                                <td className="py-2 px-2">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
                                        style={{
                                            color: getStatusColor(requisition.status),
                                            backgroundColor: `${getStatusColor(requisition.status)}20`
                                        }}
                                    >
                                        {getStatusIcon(requisition.status)}
                                        <span className="ml-1">{requisition?.status?.split('_')?.join(' ')}</span>
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-gray-700">{formatDate(requisition.created_at)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <Link
                                            to={`${requisition.id}`}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View More"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </Link>
                                        {renderActionButtonBasedOnUser(user, requisition)}
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
            {currentRequisitions.map((requisition) => (
                <div key={requisition.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs truncate">{requisition.site?.name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs truncate">{requisition.requestedBy?.full_name || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="space-y-1 mb-3">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <span
                                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                                style={{
                                    color: getStatusColor(requisition.status),
                                    backgroundColor: `${getStatusColor(requisition.status)}20`
                                }}
                            >
                                {getStatusIcon(requisition.status)}
                                <span className="ml-1">{requisition.status?.replace('_', ' ')}</span>
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Items: {requisition.items?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                            Qty: {requisition.items?.reduce((sum, item) => sum + item.qty_requested, 0) || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                            Created: {formatDate(requisition.created_at)}
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                        <button
                            onClick={() => IssueMaterialPage(requisition)}
                            className="text-gray-400 hover:text-primary-600 p-1"
                            title="View Requisition"
                            aria-label="View requisition details"
                        >
                            <Eye className="w-3 h-3" />
                        </button>
                        {renderActionButtonBasedOnUser(user, requisition)}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentRequisitions.map((requisition) => (
                <div
                    key={requisition.id}
                    className="px-4 py-3 hover:bg-gray-25"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-primary-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    #{requisition.id} - {requisition.site?.name || 'N/A'}
                                </div>
                                <div className="text-gray-500 text-xs truncate">
                                    Requested by: {requisition.requestedBy?.full_name || 'N/A'}
                                </div>
                                <div className="text-gray-500 text-xs truncate">
                                    Created: {formatDate(requisition.created_at)}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span
                                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                                style={{
                                    color: getStatusColor(requisition.status),
                                    backgroundColor: `${getStatusColor(requisition.status)}20`
                                }}
                            >
                                {getStatusIcon(requisition.status)}
                                <span className="ml-1">{requisition.status?.split('_').join(' ')}</span>
                            </span>
                            <button
                                onClick={() => IssueMaterialPage(requisition)}
                                className="text-primary-600 hover:text-primary-800"
                                title="View Requisition"
                                aria-label="View requisition details"
                            >
                                View More
                            </button>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => IssueMaterialPage(requisition)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View Requisition"
                                aria-label="View requisition details"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            {renderActionButtonBasedOnUser(user, requisition)}
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
                    Showing {startIndex + 1}-{Math.min(endIndex, requisitions.length)} of {requisitions.length}
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
            <AddRequisitionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveRequisition}
            />
            <EditRequisitionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                requisition={selectedRequisition}
                onSave={handleSaveRequisition}
            />
            <DeleteRequisitionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                requisition={selectedRequisition}
                onDelete={handleDelete}
            />
            <ViewRequisitionModal
                isOpen={isViewModalOpen}
                requisition={selectedRequisition}
                onClose={() => setIsViewModalOpen(false)}
            />
            <ApproveRequisitionModal
                isOpen={isApproveModalOpen}
                requisition={selectedRequisition}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    setSelectedRequisition(null);
                }}
                onApprove={handleApproveSuccess}
            />
            <RejectRequisitionModal
                isOpen={isRejectModalOpen}
                requisition={selectedRequisition}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setSelectedRequisition(null);
                }}
                onReject={handleRejectSuccess}
            />
            <ReceiveMaterialsModal
                isOpen={isReceiveModalOpen}
                requisition={selectedRequisition}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setSelectedRequisition(null);
                }}
                onReceive={handleReceiveSuccess}
            />
            <ModifyRequisitionModal
                isOpen={isModifyModalOpen}
                requisition={selectedRequisition}
                onClose={() => {
                    setIsModifyModalOpen(false);
                    setSelectedRequisition(null);
                }}
                onModify={handleModifySuccess}
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
            <div className="bg-white shadow-md">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Material Requisition Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage material requisitions for sites</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || requisitions.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                                aria-label="Export to PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            {user?.role.name === 'SITE_ENGINEER' && (
                                <button
                                    onClick={handleAddRequisition}
                                    disabled={operationLoading}
                                    className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                    aria-label="Add new requisition"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>New Requisition</span>
                                </button>
                            )}
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
                                <p className="text-xs text-gray-600">Total Requisitions</p>
                                <p className="text-lg font-semibold text-gray-900">{totalRequisitions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Edit className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Draft</p>
                                <p className="text-lg font-semibold text-gray-900">{draftRequisitions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Pending</p>
                                <p className="text-lg font-semibold text-gray-900">{pendingRequisitions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Approved</p>
                                <p className="text-lg font-semibold text-gray-900">{approvedRequisitions}</p>
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
                                    placeholder="Search requisitions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search requisitions"
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
                                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [keyof MaterialRequisition, 'asc' | 'desc'];
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                aria-label="Sort options"
                            >
                                <option value="site_id-asc">Site (A-Z)</option>
                                <option value="site_id-desc">Site (Z-A)</option>
                                <option value="created_at-asc">Created At (Oldest First)</option>
                                <option value="created_at-desc">Created At (Newest First)</option>
                                <option value="requestedBy-asc">Requested By (A-Z)</option>
                                <option value="requestedBy-desc">Requested By (Z-A)</option>
                            </select>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="Table View"
                                    aria-label="Switch to table view"
                                >
                                    <LayoutGrid className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="Grid View"
                                    aria-label="Switch to grid view"
                                >
                                    <LayoutGrid className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="List View"
                                    aria-label="Switch to list view"
                                >
                                    <List className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        aria-label="Filter by start date"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        aria-label="Filter by end date"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="DSE_REVIEW">DSE Review</option>
                                    <option value="VERIFIED">Verified</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="PARTIALLY_ISSUED">Partially Issued</option>
                                    <option value="ISSUED">Issued</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="RECEIVED">Received</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <button
                                    onClick={handleClearDates}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                                    aria-label="Clear date filters"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Clear Dates</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setDateFrom('');
                                        setDateTo('');
                                        setSortBy('site_id');
                                        setSortOrder('asc');
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                                    aria-label="Reset all filters"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Clear All</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                ) : requisitions.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-6 text-center">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No requisitions found.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default RequisitionManagement;