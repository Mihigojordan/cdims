import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import { type Request, type Store, type IssueMaterialPayload, type Stock } from '../../../services/stockService';
import stockService from '../../../services/stockService';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

interface IssueMaterialItem {
  request_item_id: number;
  qty_issued: number;
  checked: boolean;
  store_id: number;
}

interface IssueMaterialForm {
  request_id: number;
  items: IssueMaterialItem[];
  notes: string;
}

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const IssueMaterialPage: React.FC = () => {
  const [issueForm, setIssueForm] = useState<IssueMaterialForm>({
    request_id: 0,
    items: [],
    notes: '',
  });
  const [requests, setRequests] = useState<Request[]>([]);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stockLoading, setStockLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const issuableRequests = requests.filter(
    req => req.status === 'APPROVED' || req.status === 'PARTIALLY_ISSUED'  || req.status === 'RECEIVED'
  );

  const selectedRequest = issuableRequests.find((req) => req.id === issueForm.request_id);
  const requestItems = selectedRequest?.items || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const requestsResponse = await stockService.getIssuableRequests();
        setRequests(requestsResponse.requests || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load issuable requests');
        showOperationStatus('error', err.message || 'Failed to load issuable requests');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (issueForm.request_id) {
      const fetchStock = async () => {
        try {
          setStockLoading(true);
          const response = await stockService.getAllStock();
          const stock = response.stock;
          setStockData(stock);
          setIssueForm(prevForm => ({
            ...prevForm,
            items: prevForm.items.map(item => {
              const requestItem = requests
                .find(req => req.id === issueForm.request_id)
                ?.items.find(ri => ri.id === item.request_item_id);
              if (requestItem) {
                const stockForMaterial = stock.find(s => s.material_id === requestItem.material_id);
                return {
                  ...item,
                  store_id: stockForMaterial ? stockForMaterial.store_id : 0,
                };
              }
              return item;
            }),
          }));
        } catch (err) {
          showOperationStatus('error', 'Failed to fetch stock data');
        } finally {
          setStockLoading(false);
        }
      };
      fetchStock();
    }
  }, [issueForm.request_id, requests]);

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const onClose = () => {
    setIssueForm({ request_id: 0, items: [], notes: '' });
    setStockData([]);
    setShowConfirm(false);
    navigate('/admin/dashboard/issuable-materials', { replace: true });
  };

  const handleRequestChange = (requestId: number) => {
    const selectedReq = issuableRequests.find(req => req.id === requestId);
    const items = selectedReq?.items.map(item => {
      const stockForMaterial = stockData.find(s => s.material_id === item.material_id);
      
      const qtyIssued = Number(item.qty_issued || 0);
      const qtyRemaining = Number(item.qty_remaining || 0);
      const qtyApproved = Number(item.qty_approved || 0);
      const qtyRequested = Number(item.qty_requested || 0);
      
      let defaultQty = 0;
      if (qtyRemaining > 0) {
        defaultQty = qtyRemaining;
      } else if (qtyApproved > 0) {
        defaultQty = qtyApproved;
      } else {
        defaultQty = qtyRequested;
      }
      
      return {
        request_item_id: item.id,
        qty_issued: defaultQty,
        checked: false,
        store_id: stockForMaterial ? stockForMaterial.store_id : 0,
      };
    }) || [];
    
    const defaultNotes = selectedReq
      ? `Issued to ${selectedReq.requestedBy?.full_name || 'N/A'} for ${selectedReq.site?.name || 'N/A'}`
      : '';
    setIssueForm({ request_id: requestId, items, notes: defaultNotes });
    setShowConfirm(false);
  };

  const handleItemCheck = (requestItemId: number, checked: boolean) => {
    setIssueForm(prevForm => {
      const updatedItems = prevForm.items.map(item => {
        if (item.request_item_id === requestItemId) {
          if (checked) {
            const requestItem = requestItems.find(ri => ri.id === requestItemId);
            if (requestItem) {
              const qtyIssued = Number(requestItem.qty_issued || 0);
              const qtyRemaining = Number(requestItem.qty_remaining || 0);
              const qtyApproved = Number(requestItem.qty_approved || 0);
              const qtyRequested = Number(requestItem.qty_requested || 0);
              
              let autoQty = 0;
              if (qtyRemaining > 0) {
                autoQty = qtyRemaining;
              } else if (qtyApproved > 0) {
                autoQty = qtyApproved;
              } else {
                autoQty = qtyRequested;
              }
              
              const stock = stockData.find(s => s.material_id === requestItem.material_id && s.store_id === item.store_id);
              const availableQty = stock?.qty_on_hand || 0;
              const finalQty = Math.min(autoQty, availableQty);
              
              return { ...item, checked, qty_issued: finalQty };
            }
          }
          return { ...item, checked };
        }
        return item;
      });
      
      return { ...prevForm, items: updatedItems };
    });
    setShowConfirm(false);
  };

  const debouncedHandleQuantityChange = debounce((requestItemId: number, qty: number) => {
    const selectedItem = requestItems.find(item => item.id === requestItemId);
    if (!selectedItem) return;
    
    const qtyIssued = Number(selectedItem.qty_issued || 0);
    const qtyRemaining = Number(selectedItem.qty_remaining || 0);
    const qtyApproved = Number(selectedItem.qty_approved || 0);
    const qtyRequested = Number(selectedItem.qty_requested || 0);
    
    let maxQty = 0;
    if (qtyRemaining > 0) {
      maxQty = qtyRemaining;
    } else if (qtyApproved > 0) {
      maxQty = qtyApproved - qtyIssued;
    } else {
      maxQty = qtyRequested - qtyIssued;
    }
    
    const validatedQty = Math.max(0, Math.min(qty, maxQty));
    
    setIssueForm({
      ...issueForm,
      items: issueForm.items.map(item =>
        item.request_item_id === requestItemId ? { ...item, qty_issued: validatedQty } : item
      ),
    });
    setShowConfirm(false);
  }, 0);

  const handleQuantityChange = (requestItemId: number, qty: number) => {
    debouncedHandleQuantityChange(requestItemId, qty);
  };

  const handleIssueMaterials = async () => {
    if (!issueForm.request_id || issueForm.items.every(item => !item.checked)) {
      showOperationStatus('error', 'Please select a request and at least one item to issue');
      return;
    }

    const invalidItems = issueForm.items.filter(item => item.checked && (
      item.qty_issued <= 0 ||
      isNaN(item.qty_issued) ||
      item.store_id === 0
    ));
    if (invalidItems.length > 0) {
      showOperationStatus('error', 'Invalid quantities or no store available for selected items');
      return;
    }

    for (const item of issueForm.items.filter(item => item.checked)) {
      const requestItem = requestItems.find(ri => ri.id === item.request_item_id);
      if (requestItem) {
        const stock = stockData.find(s => s.material_id === requestItem.material_id && s.store_id === item.store_id);
        const availableQty = stock?.qty_on_hand || 0;
        if (!stock) {
          showOperationStatus('error', `No stock available for ${requestItem.material?.name || 'item'}`);
          return;
        }
        if (item.qty_issued > availableQty) {
          showOperationStatus('error', `Insufficient stock for ${requestItem.material?.name || 'item'}. Available: ${availableQty}`);
          return;
        }
      }
    }

    setShowConfirm(true);
  };

  const confirmIssueMaterials = async () => {
    try {
      setOperationLoading(true);
      const payload: IssueMaterialPayload = {
        request_id: issueForm.request_id,
        items: issueForm.items
          .filter(item => item.checked)
          .map(item => ({
            request_item_id: item.request_item_id,
            qty_issued: item.qty_issued,
            store_id: item.store_id,
            notes: issueForm.notes,
          })),
      };
      await stockService.issueMaterials(payload);
      showOperationStatus('success', 'Materials issued successfully', 5000);
      setIssueForm({ request_id: 0, items: [], notes: '' });
      setStockData([]);
      setShowConfirm(false);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message.includes('already been issued')
        ? err.message
        : err.message.includes('not found')
        ? err.message
        : err.message.includes('more than requested')
        ? err.message
        : err.message.includes('Insufficient stock')
        ? err.message
        : 'Failed to issue materials';
      showOperationStatus('error', errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const renderConfirmation = () => {
    if (!showConfirm) return null;
    const selectedItems = issueForm.items.filter(item => item.checked);
    return (
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">Confirm Issuance</h4>
        </div>
        <p className="text-sm text-blue-700 mb-3">You are about to issue the following items:</p>
        <div className="bg-white border border-blue-200 rounded p-3 mb-4 max-h-32 overflow-y-auto">
          {selectedItems.map(item => {
            const requestItem = requestItems.find(ri => ri.id === item.request_item_id);
            const stock = stockData.find(s => s.store_id === item.store_id);
            return (
              <div key={item.request_item_id} className="flex justify-between items-center py-1 border-b border-blue-100 last:border-b-0">
                <span className="text-sm font-medium text-gray-900">
                  {requestItem?.material?.name || 'N/A'}
                </span>
                <span className="text-sm text-gray-600">
                  {item.qty_issued} {requestItem?.material?.unit?.symbol || ''} 
                  <span className="text-xs text-gray-500 ml-1">
                    ({stock?.store.name || 'N/A'})
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            disabled={operationLoading}
          >
            Cancel
          </button>
          <button
            onClick={confirmIssueMaterials}
            disabled={operationLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Confirm Issue
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white flex overflow-y-auto max-h-[90vh] items-center justify-center z-50 p-4">
        <div className="rounded-xl w-full">
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-700 text-base font-medium">Loading requests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (issuableRequests.length === 0) {
    return (
      <div className="bg-white flex overflow-y-auto max-h-[90vh] items-center justify-center z-50 p-4">
        <div className="rounded-xl w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-6 bg-yellow-100 rounded-full mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Issuable Requests Available</h3>
            <p className="text-base text-gray-600 text-center max-w-md mb-8">
              There are currently no approved or partially issued requests that can have materials issued. 
              Please check back later or ensure requests have been approved first.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 text-base font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex overflow-y-auto max-h-[90vh] items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Issue Materials</h3>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request</label>
              <select
                value={issueForm.request_id}
                onChange={(e) => handleRequestChange(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                disabled={operationLoading}
                aria-label="Select an issuable material request"
              >
                <option value={0}>Select a request</option>
                {issuableRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    #{request.id} - {request.site?.name || 'N/A'} ({request.status})
                  </option>
                ))}
              </select>
            </div>

            {!stockData.length && !stockLoading && issueForm.request_id !== 0 && (
              <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>No stock data available</span>
              </p>
            )}

            {requestItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Requested Items</label>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {requestItems.map((item) => {
                    const formItem = issueForm.items.find(i => i.request_item_id === item.id);
                    const qtyIssued = Number(item.qty_issued || 0);
                    const qtyRemaining = Number(item.qty_remaining || 0);
                    const qtyApproved = Number(item.qty_approved || 0);
                    const qtyRequested = Number(item.qty_requested || 0);
                    
                    let maxQty = 0;
                    if (qtyRemaining > 0) {
                      maxQty = qtyRemaining;
                    } else if (qtyApproved > 0) {
                      maxQty = qtyApproved - qtyIssued;
                    } else {
                      maxQty = qtyRequested - qtyIssued;
                    }
                    
                    const isFullyIssued = qtyIssued >= (qtyApproved || qtyRequested) && maxQty <= 0;
                    const isPartiallyIssued = qtyIssued > 0 && maxQty > 0;
                    const stock = stockData.find(s => s.material_id === item.material_id);
                    const availableQty = stock?.qty_on_hand || 0;
                    const storeName = stock?.store.name || 'N/A';
                    
                    return (
                      <div key={item.id} className={`border rounded-lg p-4 transition-colors duration-200 ${
                        isFullyIssued
                          ? 'border-green-200 bg-green-50'
                          : isPartiallyIssued
                          ? 'border-orange-200 bg-orange-50'
                          : formItem?.checked
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={formItem?.checked || false}
                            onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            disabled={isFullyIssued || operationLoading || !stock}
                            aria-label={`Select ${item.material?.name || 'item'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className={`text-sm font-medium ${isFullyIssued ? 'text-green-700' : isPartiallyIssued ? 'text-orange-700' : 'text-gray-900'}`}>
                                {item.material?.name || 'N/A'}
                                {isFullyIssued && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Fully Issued
                                  </span>
                                )}
                                {isPartiallyIssued && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Partially Issued
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 space-y-1">
                              <div className="flex justify-between">
                                <span>Requested: {qtyRequested} {item.material?.unit?.symbol || ''}</span>
                                <span>Approved: {qtyApproved || 0} {item.material?.unit?.symbol || ''}</span>
                              </div>
                              {qtyIssued > 0 && (
                                <div className="flex justify-between font-medium text-orange-600">
                                  <span>Already Issued: {qtyIssued} {item.material?.unit?.symbol || ''}</span>
                                  {qtyRemaining > 0 && (
                                    <span className="text-primary-600">Remaining: {qtyRemaining} {item.material?.unit?.symbol || ''}</span>
                                  )}
                                </div>
                              )}
                              <div className={`text-sm ${stock ? 'text-green-600' : 'text-red-600'}`}>
                                Available: {stock ? `${availableQty} in ${storeName}` : 'No stock available'}
                              </div>
                            </div>
                            {formItem?.checked && !isFullyIssued && stock && (
                              <div className="pt-3 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantity to Issue
                                  {isPartiallyIssued && (
                                    <span className="text-xs text-orange-600 ml-2">(Remaining: {maxQty})</span>
                                  )}
                                </label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={formItem.qty_issued}
                                    onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                    min="0"
                                    max={maxQty}
                                    step="0.01"
                                    placeholder={`Max ${maxQty}`}
                                    disabled={operationLoading}
                                    aria-label={`Quantity for ${item.material?.name || 'item'}`}
                                  />
                                  <span className="text-sm text-gray-500 min-w-0">
                                    {item.material?.unit?.symbol || ''}
                                  </span>
                                </div>
                                {formItem.qty_issued > maxQty && (
                                  <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                                    <XCircle className="w-4 h-4" />
                                    <span>Cannot exceed {isPartiallyIssued ? 'remaining' : 'approved'} quantity ({maxQty})</span>
                                  </p>
                                )}
                                {formItem.qty_issued > availableQty && (
                                  <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                                    <XCircle className="w-4 h-4" />
                                    <span>Insufficient stock. Available: {availableQty}</span>
                                  </p>
                                )}
                              </div>
                            )}
                            {!stock && formItem?.checked && (
                              <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                                <XCircle className="w-4 h-4" />
                                <span>No stock available for this material</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={issueForm.notes}
                onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors duration-200"
                rows={3}
                disabled={operationLoading}
                placeholder="Add any additional notes..."
                aria-label="Additional notes"
              />
            </div>

            {renderConfirmation()}
          </div>
        </div>

        {!showConfirm && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              disabled={operationLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleIssueMaterials}
              disabled={operationLoading || !requestItems.length}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Issue
            </button>
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] transition-all duration-300 ${
              operationStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : operationStatus.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-primary-50 border border-primary-200 text-primary-800'
            }`}
          >
            {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {operationStatus.type === 'info' && <AlertCircle className="w-5 h-5 text-primary-600" />}
            <span className="font-medium text-sm flex-1">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {operationLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-sm font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueMaterialPage;