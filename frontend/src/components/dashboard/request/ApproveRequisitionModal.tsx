import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import requisitionService, { type MaterialRequisition } from '../../../services/requestService';
import useAuth from '../../../context/AuthContext';

interface ApproveRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: MaterialRequisition | null;
  onApprove: (updatedRequisition: MaterialRequisition) => void;
}

const ApproveRequisitionModal: React.FC<ApproveRequisitionModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onApprove,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemModifications, setItemModifications] = useState<
    { request_item_id: number; qty_approved: number }[]
  >([]);

  const { user } = useAuth();
  const level = user?.role.name === 'PADIRI' ? 'PADIRI' : 'DSE';
  
  // ✅ Auto populate item modifications when modal opens and user is DSE
  useEffect(() => {
    if (isOpen && requisition && level === 'DSE') {
      const defaults = requisition.items.map((item) => ({
        request_item_id: item.id,
        qty_approved: item.qty_requested, // start with requested qty
      }));
      setItemModifications(defaults);
    }
  }, [isOpen, requisition, level]);

  // For DSE: track quantity modifications
  if (!isOpen || !requisition) return null;
  const handleQtyChange = (itemId: number, qty: number) => {
    setItemModifications((prev) => {
      const existing = prev.find((m) => m.request_item_id === itemId);
      if (existing) {
        return prev?.map((m) =>
          m.request_item_id === itemId ? { ...m, qty_approved: qty } : m
        );
      }
      return [...prev, { request_item_id: itemId, qty_approved: qty }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const updatedRequisition = await requisitionService.approveRequisition(
        requisition.id.toString(),
        level,
        comment,
        level === 'DSE' ? itemModifications : undefined
      );

      console.log(updatedRequisition);
      

      onApprove(updatedRequisition);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setError(null);
    setItemModifications([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Approve Requisition #{requisition.id}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* For DSE, allow quantity modifications */}
            {level === 'DSE' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Modify Approved Quantities
                </label>
                <div className="space-y-2">
                  {requisition?.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span>{item.material.name}</span>
                      <input
                        type="number"
                        defaultValue={item.qty_requested}
                        min={0}
                        className="w-20 border border-gray-200 rounded px-1 py-0.5 text-right"
                        onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Enter any comments or reasons for your decision..."
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-800 text-xs bg-red-50 border border-red-200 rounded p-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Approve'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveRequisitionModal;
