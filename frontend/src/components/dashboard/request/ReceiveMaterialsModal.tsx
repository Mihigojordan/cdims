import React, { useState, useEffect } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import type { MaterialRequisition, ReceiveMaterialItem, ReceiveMaterialsResponse } from '../../../services/requestService';
import requisitionService from '../../../services/requestService';

interface ReceiveMaterialsModalProps {
    isOpen: boolean;
    requisition: MaterialRequisition | null;
    onClose: () => void;
    onReceive: (response: ReceiveMaterialsResponse) => void;
}

const ReceiveMaterialsModal: React.FC<ReceiveMaterialsModalProps> = ({ 
    isOpen, 
    requisition, 
    onClose, 
    onReceive 
}) => {
    const [items, setItems] = useState<ReceiveMaterialItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Initialize items when modal opens or requisition changes
    useEffect(() => {
        if (isOpen && requisition) {
            const initialItems = requisition.items
                ?.filter(item => (item.qty_issued || 0) > 0) // Only include issued items
                .map(item => ({
                    request_item_id: item.id,
                    qty_received: item.qty_issued || 0, // Default to full quantity issued
                })) || [];
            setItems(initialItems);
            setSubmitError(null);
        }
    }, [isOpen, requisition]);

    const handleQuantityChange = (requestItemId: number, value: string) => {
        // Allow empty string, convert to number only when not empty
        const numValue = value === '' ? '' : parseFloat(value);
        
        setItems(prev =>
            prev.map(item =>
                item.request_item_id === requestItemId 
                    ? { ...item, qty_received: isNaN(numValue as number) ? '' : numValue }
                    : item
            )
        );
        
        // Clear submit error when user makes changes
        if (submitError) {
            setSubmitError(null);
        }
    };

    // Validation helpers
    const getItemValidation = (item: ReceiveMaterialItem) => {
        const requisitionItem = requisition?.items.find(ri => ri.id === item.request_item_id);
        const qtyIssued = requisitionItem?.qty_issued || 0;
        const qtyReceived = typeof item.qty_received === 'string' ? parseFloat(item.qty_received) : item.qty_received;
        
        // Allow empty values during editing
        if (item.qty_received === '' || item.qty_received === null || item.qty_received === undefined) {
            return { isValid: false, message: 'Required' };
        }
        
        if (isNaN(qtyReceived) || qtyReceived <= 0) {
            return { isValid: false, message: 'Must be greater than 0' };
        }
        
        if (qtyReceived > qtyIssued) {
            return { isValid: false, message: `Max: ${qtyIssued}` };
        }
        
        return { isValid: true, message: '' };
    };

    const isFormValid = () => {
        return items.length > 0 && items.every(item => getItemValidation(item).isValid);
    };

    const handleSubmit = async () => {
        if (!requisition?.id) {
            setSubmitError('No requisition selected');
            return;
        }

        if (!isFormValid()) {
            setSubmitError('Please correct all quantity errors before submitting');
            return;
        }

        try {
            setLoading(true);
            setSubmitError(null);
            console.log(items);
            
            const response = await requisitionService.receiveMaterials(requisition.id.toString(), items);
            onReceive(response);
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to receive materials');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setItems([]);
            setSubmitError(null);
            onClose();
        }
    };

    if (!isOpen || !requisition) return null;

    const issuedItems = requisition.items?.filter(item => (item.qty_issued || 0) > 0) || [];
    const notIssuedItems = requisition.items?.filter(item => (item.qty_issued || 0) === 0) || [];
    const allItems = requisition.items || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Receive Materials for Requisition #{requisition.id}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* Submit Error */}
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center space-x-2 text-red-800 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    {/* Requisition Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Site:</span> {requisition.site?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">Requested By:</span> {requisition.requestedBy?.full_name || 'N/A'}
                        </p>
                    </div>

                    {/* Materials Table */}
                    {allItems.length > 0 ? (
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-3 text-gray-600 font-medium">Material</th>
                                        <th className="text-left py-3 px-3 text-gray-600 font-medium">Unit</th>
                                        <th className="text-right py-3 px-3 text-gray-600 font-medium">Qty Issued</th>
                                        <th className="text-right py-3 px-3 text-gray-600 font-medium">Qty Received</th>
                                        <th className="text-left py-3 px-3 text-gray-600 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allItems.map((requisitionItem) => {
                                        const item = items.find(i => i.request_item_id === requisitionItem.id);
                                        const validation = item ? getItemValidation(item) : { isValid: true, message: '' };
                                        const isIssued = (requisitionItem.qty_issued || 0) > 0;
                                        const hasRemaining = (requisitionItem.qty_remaining || 0) > 0;
                                        
                                        return (
                                            <tr key={requisitionItem.id} className={`hover:bg-gray-25 ${!isIssued ? 'bg-gray-50' : ''}`}>
                                                <td className="py-3 px-3 text-gray-700">
                                                    {requisitionItem.material.name}
                                                </td>
                                                <td className="py-3 px-3 text-gray-700">
                                                    {requisitionItem.material.unit?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 px-3 text-right text-gray-700 font-medium">
                                                    {requisitionItem.qty_issued || 0}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {isIssued ? (
                                                        <div className="flex flex-col items-end space-y-1">
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                min="0"
                                                                max={requisitionItem.qty_issued || 0}
                                                                value={item?.qty_received ?? ''}
                                                                onChange={(e) => handleQuantityChange(requisitionItem.id, e.target.value)}
                                                                placeholder="0"
                                                                className={`w-24 px-2 py-1 border rounded text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                                                    !validation.isValid 
                                                                        ? 'border-red-300 bg-red-50' 
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                                disabled={loading}
                                                                aria-label={`Quantity received for ${requisitionItem.material.name}`}
                                                            />
                                                            {!validation.isValid && validation.message && (
                                                                <p className="text-red-500 text-xs">{validation.message}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end">
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {!isIssued ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                            Not yet issued
                                                        </span>
                                                    ) : hasRemaining ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                                            {requisitionItem.qty_remaining} remaining
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                                                            Ready
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 text-xs">
                            No materials in this requisition.
                        </div>
                    )}

                    {/* Info messages */}
                    {notIssuedItems.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start space-x-2 text-yellow-800 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Some materials are not yet issued</p>
                                <p className="text-yellow-700">
                                    {notIssuedItems.length} material{notIssuedItems.length > 1 ? 's' : ''} {notIssuedItems.length > 1 ? 'are' : 'is'} waiting to be issued by the storekeeper.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {allItems.some(item => (item.qty_remaining || 0) > 0 && (item.qty_issued || 0) > 0) && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-start space-x-2 text-blue-800 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Materials will be delivered soon</p>
                                <p className="text-blue-700">
                                    Some materials have remaining quantities that will be issued and delivered in the next batch.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !isFormValid() || issuedItems.length === 0}
                        className="flex items-center space-x-1 px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span>{loading ? 'Processing...' : 'Confirm Receipt'}</span>
                    </button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 text-sm font-medium">Processing receipt...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiveMaterialsModal