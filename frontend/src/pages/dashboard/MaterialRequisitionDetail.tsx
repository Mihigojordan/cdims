/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Paperclip,
  Upload,
  Trash2,
  Clock,
  User,
  Building,
  FileText,
  Calendar,
  Edit,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Package2,
} from 'lucide-react';
import requisitionService, {
  type MaterialRequisition,
  type CreateRequisitionInput,
  type UpdateRequisitionInput,
  type ApproveInput,
  type RejectInput,
  type CommentInput,
  type AttachmentInput,
  type Comment,
  type Attachment,
} from '../../services/requestService';
import { formatDate } from '../../utils/dateUtils';

interface RequisitionItem {
  id: number;
  material_id: number;
  unit_id: number;
  qty_requested: number;
  qty_approved: number;
  material: {
    id: number;
    name: string;
    description: string;
    code: string;
    specifications: string;
    unit_price: number | null; // Allow null for unit_price
    category: { id: number; name: string };
    unit: { id: number; name: string; symbol: string } | null;
    created_at: string;
    updated_at: string;
  };
}

interface Approval {
  id: number;
  level: string;
  action: string;
  comment: string;
  reviewer: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: { id: number; name: string };
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

interface Site {
  id: number;
  code: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: { id: number; name: string };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialRequisition {
  id: number;
  site_id: number;
  requested_by: number;
  notes: string;
  status: string;
  site: Site;
  requestedBy: User;
  items: RequisitionItem[];
  approvals: Approval[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const MaterialRequisitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [requisition, setRequisition] = useState<MaterialRequisition | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCommentsForm, setShowCommentsForm] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComments, setRejectComments] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequisitionDetails(parseInt(id));
      fetchComments(parseInt(id));
      fetchAttachments(parseInt(id));
    }
  }, [id]);

  const fetchRequisitionDetails = async (reqId: number) => {
    try {
      setLoading(true);
      const response: ApiResponse<{ request: MaterialRequisition }> = await requisitionService.getRequisitionById(reqId);
      if (response.success) {
        console.log('Requisition Data:', response.data.request); // Debug API response
        setRequisition(response.data.request);
      } else {
        setError('Failed to fetch requisition details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requisition details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (reqId: number) => {
    try {
      const response: ApiResponse<Comment[]> = await requisitionService.getComments(reqId);
      if (response.success) {
        setComments(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const fetchAttachments = async (reqId: number) => {
    try {
      const response: ApiResponse<Attachment[]> = await requisitionService.getAttachments(reqId);
      if (response.success) {
        setAttachments(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch attachments:', err);
    }
  };

  const showOperationStatus = (type: 'success' | 'error', message: string) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const handleApprove = async (isStorekeeper = false) => {
    if (!requisition) return;
    try {
      setApproving(true);
      const comments = prompt(isStorekeeper ? 'Enter approval comments for storekeeper:' : 'Enter approval comments:') || '';
      if (!comments.trim()) return;

      const input: ApproveInput = { comments };
      const response: ApiResponse<{ request: MaterialRequisition }> = isStorekeeper
        ? await requisitionService.approveStorekeeper(requisition.id, input)
        : await requisitionService.approveRequisition(requisition.id, input);

      if (response.success) {
        setRequisition(response.data.request);
        showOperationStatus('success', response.message || 'Request approved successfully');
      } else {
        showOperationStatus('error', 'Failed to approve request');
      }
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!requisition || !rejectReason || !rejectComments) return;
    try {
      setRejecting(true);
      const input: RejectInput = { reason: rejectReason, comments: rejectComments };
      const response: ApiResponse<{ request: MaterialRequisition }> = await requisitionService.rejectRequisition(requisition.id, input);

      if (response.success) {
        setRequisition(response.data.request);
        setShowRejectModal(false);
        setRejectReason('');
        setRejectComments('');
        showOperationStatus('success', response.message || 'Request rejected');
      } else {
        showOperationStatus('error', 'Failed to reject request');
      }
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !requisition) return;
    try {
      const input: CommentInput = { comment: newComment };
      const response: ApiResponse<Comment> = await requisitionService.addComment(requisition.id, input);
      if (response.success) {
        setComments([response.data, ...comments]);
        setNewComment('');
        showOperationStatus('success', 'Comment added successfully');
      } else {
        showOperationStatus('error', 'Failed to add comment');
      }
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to add comment');
    }
  };

  const handleUploadAttachment = async () => {
    if (!fileInput || !requisition) return;
    try {
      setUploading(true);
      const input: AttachmentInput = new FormData();
      input.append('file', fileInput);
      if (fileDescription) input.append('description', fileDescription);

      const response: ApiResponse<{ attachment: Attachment }> = await requisitionService.uploadAttachment(requisition.id, input);
      if (response.success) {
        setAttachments([response.data.attachment, ...attachments]);
        setFileInput(null);
        setFileDescription('');
        showOperationStatus('success', response.message || 'Attachment uploaded successfully');
      } else {
        showOperationStatus('error', 'Failed to upload attachment');
      }
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading requisition details...</div>;
  }

  if (error || !requisition) {
    return <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">Error: {error || 'Requisition not found'}</div>;
  }

  // Calculate totals safely
  const totalRequested = requisition.items?.reduce((sum, item) => sum + item.qty_requested, 0) || 0;
  const totalApproved = requisition.items?.reduce((sum, item) => sum + item.qty_approved, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Operation Status */}
      {operationStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          operationStatus.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {operationStatus.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requisition #{requisition.id}</h1>
            <p className="text-sm text-gray-500">Details for material requisition</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            requisition.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            requisition.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            requisition.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {requisition.status.replace('_', ' ')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Site: {requisition.site.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Requested by: {requisition.requestedBy.full_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Created: {formatDate(requisition.created_at)}</span>
          </div>
        </div>
        {requisition.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <FileText className="w-4 h-4 text-gray-400 inline mr-2" />
            <span className="font-medium">Notes:</span> {requisition.notes}
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          {requisition.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(false)}
                disabled={approving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleApprove(true)}
                disabled={approving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve for Storekeeper</span>
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={rejecting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Package2 className="w-5 h-5" />
          <span>Items Requested</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Material</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-right">Qty Requested</th>
                <th className="px-4 py-2 text-right">Qty Approved</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {requisition.items?.length > 0 ? (
                requisition.items.map((item, index) => {
                  const unitPrice = typeof item.material.unit_price === 'number' && !isNaN(item.material.unit_price)
                    ? item.material.unit_price
                    : null;
                  const total = unitPrice !== null ? unitPrice * item.qty_approved : null;

                  return (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-2 font-medium">{item.material.name}</td>
                      <td className="px-4 py-2">{item.material.code}</td>
                      <td className="px-4 py-2 text-right">
                        {item.qty_requested} {item.material.unit?.symbol || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {item.qty_approved} {item.material.unit?.symbol || 'N/A'}
                      </td>
                      <td className="px-4 py-2">{item.material.unit?.name || 'N/A'}</td>
                      <td className="px-4 py-2 text-right">
                        {unitPrice !== null
                          ? `$${unitPrice.toFixed(2)}`
                          : <span className="text-yellow-600">N/A</span>}
                        {unitPrice === 0 && (
                          <span className="text-yellow-600 text-sm ml-2" title="Unit price is zero">⚠</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {total !== null
                          ? `$${total.toFixed(2)}`
                          : <span className="text-yellow-600">N/A</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    No items available
                  </td>
                </tr>
              )}
              <tr className="font-semibold">
                <td colSpan={2} className="px-4 py-2 text-right">Totals:</td>
                <td className="px-4 py-2 text-right">{totalRequested}</td>
                <td className="px-4 py-2 text-right">{totalApproved}</td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 text-right">
                  {requisition.items?.length > 0
                    ? `$${requisition.items.reduce((sum, item) => {
                        const unitPrice = typeof item.material.unit_price === 'number' && !isNaN(item.material.unit_price)
                          ? item.material.unit_price
                          : 0;
                        return sum + (unitPrice * item.qty_approved);
                      }, 0).toFixed(2)}`
                    : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Approvals */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Approval History</h2>
        {requisition.approvals?.length > 0 ? (
          <div className="space-y-3">
            {requisition.approvals.map((approval) => (
              <div key={approval.id} className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{approval.reviewer.full_name} ({approval.level})</p>
                    <p className="text-sm text-gray-500">{approval.action} - {formatDate(approval.created_at)}</p>
                    {approval.comment && <p className="text-sm text-gray-600 mt-1">"{approval.comment}"</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    approval.action === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {approval.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No approvals yet.</p>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <button
          onClick={() => setShowCommentsForm(!showCommentsForm)}
          className="flex items-center space-x-2 mb-4 text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {showCommentsForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>Comments ({comments.length || 0})</span>
        </button>
        {showCommentsForm && (
          <div className="space-y-3">
            <div className="border rounded p-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Add Comment
              </button>
            </div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{comment.user.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="mt-2">{comment.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="flex items-center space-x-2 mb-4 text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {showAttachments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>Attachments ({attachments.length || 0})</span>
        </button>
        {showAttachments && (
          <div className="space-y-3">
            <div className="border rounded p-3">
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-2"
              />
              <input
                type="text"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="File description (optional)"
                className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={handleUploadAttachment}
                disabled={uploading || !fileInput}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
            {attachments.length > 0 ? (
              attachments.map((attachment) => (
                <div key={attachment.id} className="flex justify-between items-center border rounded p-3">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{attachment.original_name}</span>
                    <span className="text-sm text-gray-500">({(attachment.file_size / 1024).toFixed(1)} KB)</span>
                    {attachment.description && <span className="text-sm text-gray-600"> - {attachment.description}</span>}
                  </div>
                  <div className="flex space-x-2">
                    <a href={`/api/attachments/${attachment.id}/download`} className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </a>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No attachments yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Requisition</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6 space-y-3">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection"
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <textarea
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Comments"
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting || !rejectReason || !rejectComments}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequisitionDetail;