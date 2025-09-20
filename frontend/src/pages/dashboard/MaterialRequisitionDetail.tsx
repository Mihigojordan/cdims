import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  Hash,
  DollarSign,
  Users,
  MessageSquare,
  Shield
} from 'lucide-react';
import requisitionService, { type MaterialRequisition } from '../../services/requestService'; // Adjust path as needed

const RequestDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the requisition ID from URL params
  const [request, setRequest] = useState<MaterialRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requisition data when component mounts
  useEffect(() => {
    const fetchRequisition = async () => {
      if (!id) {
        setError('No requisition ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await requisitionService.getRequisitionById(id);

        
        setRequest(data.data.request);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requisition details');
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id]);

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Approval color helper
  const getApprovalColor = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Date formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total value of approved items
  const calculateTotalValue = (items: MaterialRequisition['items']) => {
    return items.reduce((total, item) => {
      return total + (item.qty_approved * item.material.unit_price);
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error || !request) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error || 'No requisition data found'}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Request #{request.id}</h1>
                <p className="text-sm text-gray-500">Material Request Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">{formatDate(request.updated_at)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Value</p>
                <p className="text-sm text-gray-600">${calculateTotalValue(request.items)?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Site Information
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.site.name}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Hash className="h-4 w-4 mr-1" />
                    {request.site.code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {request.site.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requested Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Requested Items ({request.items?.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">

                  {request.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.material.name}</p>
                          <p className="text-sm text-gray-500">{item.material.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.material.specifications}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.material.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.qty_requested} {item.material.unit?.symbol || ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          item.qty_approved === item.qty_requested ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {item.qty_approved ?? '0'} {item.material.unit?.symbol || ''}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${item.material?.unit_price}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${(item.qty_approved * item.material?.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Notes
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 leading-relaxed">{request.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Requested By */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Requested By
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.requestedBy.full_name}</p>
                  <p className="text-sm text-gray-600">{request.requestedBy.role.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {request.requestedBy.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {request.requestedBy.phone}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    request.requestedBy.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.requestedBy.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Approvals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Approvals ({request?.approvals?.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {request?.approvals?.map((approval) => (
                  <div key={approval.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{approval.level}</span>
                      <span className={`text-sm font-medium ${getApprovalColor(approval.action)}`}>
                        {approval.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{approval.reviewer.full_name}</p>
                    <p className="text-sm text-gray-600 mb-2">{approval.reviewer.role.name}</p>
                    {approval.comment && (
                      <p className="text-sm text-gray-700 italic mb-2">"{approval.comment}"</p>
                    )}
                    <p className="text-xs text-gray-500">{formatDate(approval.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-medium text-gray-900">{request.items?.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Quantity:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.items.reduce((sum, item) => sum + (Number(item.qty_approved) || 0), 0)?.toFixed(3)} units
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-900">Total Value:</span>
                <span className="text-sm font-bold text-gray-900">${calculateTotalValue(request.items)?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailView;