
import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import requisitionService, { type MaterialRequisition } from '../../../services/requestService';
import materialService, { type Material, type Unit } from '../../../services/materialsService';
import useAuth from '../../../context/AuthContext';

interface ModifyRequisitionInput {
  notes: string;
  item_modifications: { request_item_id: number; qty_requested?: number; qty_approved?: number; material_id?: number; unit_id?: number }[];
  items_to_add: { material_id: number; unit_id: number; qty_requested: number; qty_approved?: number }[];
  items_to_remove: number[];
  modification_reason: string;
}

interface ModifyRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: MaterialRequisition | null;
  onModify: (response: any) => void;
}

const ModifyRequisitionModal: React.FC<ModifyRequisitionModalProps> = ({ isOpen, onClose, requisition, onModify }) => {
  const { user } = useAuth();
  const isAdminOrPadiri = user?.role.name === 'ADMIN' || user?.role.name === 'PADIRI' || user?.role.name === 'DIOCESAN_SITE_ENGINEER';
  const [formData, setFormData] = useState<ModifyRequisitionInput>({
    notes: requisition?.notes || '',
    item_modifications: [],
    items_to_add: [],
    items_to_remove: [],
    modification_reason: '',
  });
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Load materials and units when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMaterials();
      loadUnits();
      setFormData({
        notes: requisition?.notes || '',
        item_modifications: requisition?.items
          
          .map((item) => ({
            request_item_id: item.id,
            qty_requested: item.qty_requested,
            qty_approved: item.qty_approved,
            material_id: item.material_id,
            unit_id: item.unit_id,
          })) || [],
        items_to_add: [],
        items_to_remove: [],
        modification_reason: '',
      });
      setErrors([]);
    }
  }, [isOpen, requisition]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        notes: '',
        item_modifications: [],
        items_to_add: [],
        items_to_remove: [],
        modification_reason: '',
      });
      setErrors([]);
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const materialsData = await materialService.getAllMaterials();
      setMaterials(materialsData);
    } catch (error: any) {
      console.error('Error loading materials:', error);
      setErrors([error.message || 'Failed to load materials']);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const loadUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const unitsData = await materialService.getAllUnits();
      setUnits(unitsData);
    } catch (error: any) {
      console.error('Error loading units:', error);
      setErrors([error.message || 'Failed to load units']);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number,
    type: 'item_modifications' | 'items_to_add' = 'item_modifications'
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const field = name.split('.')[1];
      setFormData((prev) => {
        const newItems = [...prev[type]];
        newItems[index] = {
          ...newItems[index],
          [field]: field === 'qty_requested' || field === 'qty_approved' ? parseFloat(value) || 0 : parseInt(value, 10) || 0,
        };

        // Validate no duplicate materials
        const allMaterialIds = [
          ...prev.item_modifications.map((item) => item.material_id),
          ...prev.items_to_add.map((item) => item.material_id),
        ];
        const selectedMaterialId = parseInt(value, 10) || 0;
        if (field === 'material_id' && selectedMaterialId) {
          const isDuplicate = allMaterialIds.filter((id, i) => i !== index || type !== 'item_modifications').includes(selectedMaterialId);
          if (isDuplicate) {
            const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
            setErrors([`Cannot select the same material twice: ${selectedMaterial?.name || 'Material ID: ' + selectedMaterialId}`]);
            return prev;
          }
        }

        return { ...prev, [type]: newItems };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addNewItem = () => {
    setFormData((prev) => ({
      ...prev,
      items_to_add: [...prev.items_to_add, { material_id: 0, unit_id: 0, qty_requested: 0 }],
    }));
  };

  const removeNewItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items_to_add: prev.items_to_add.filter((_, i) => i !== index),
    }));
  };

  const toggleRemoveItem = (requestItemId: number) => {
    setFormData((prev) => {
      const items_to_remove = prev.items_to_remove.includes(requestItemId)
        ? prev.items_to_remove.filter((id) => id !== requestItemId)
        : [...prev.items_to_remove, requestItemId];
      return { ...prev, items_to_remove };
    });
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (!formData.modification_reason.trim()) {
      validationErrors.push('Modification reason is required');
    }

    formData.item_modifications.forEach((item, index) => {
      if (item.material_id === 0) {
        validationErrors.push(`Material is required for modified item ${index + 1}`);
      }
      if (item.unit_id === 0) {
        validationErrors.push(`Unit is required for modified item ${index + 1}`);
      }
      if (item.qty_requested <= 0) {
        validationErrors.push(`Valid quantity requested is required for modified item ${index + 1}`);
      }
      if (isAdminOrPadiri && (item.qty_approved === undefined || item.qty_approved < 0)) {
        validationErrors.push(`Valid approved quantity is required for modified item ${index + 1}`);
      }
    });

    formData.items_to_add.forEach((item, index) => {
      if (item.material_id === 0) {
        validationErrors.push(`Material is required for new item ${index + 1}`);
      }
      if (item.unit_id === 0) {
        validationErrors.push(`Unit is required for new item ${index + 1}`);
      }
      if (item.qty_requested <= 0) {
        validationErrors.push(`Valid quantity requested is required for new item ${index + 1}`);
      }
      if (isAdminOrPadiri && (item.qty_approved === undefined || item.qty_approved < 0)) {
        validationErrors.push(`Valid approved quantity is required for new item ${index + 1}`);
      }
    });

    const allMaterialIds = [
      ...formData.item_modifications.map((item) => item.material_id),
      ...formData.items_to_add.map((item) => item.material_id),
    ];
    const uniqueMaterialIds = new Set(allMaterialIds);
    if (uniqueMaterialIds.size !== allMaterialIds.length) {
      validationErrors.push('Duplicate materials are not allowed');
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await requisitionService.modifyRequest(requisition!.id.toString(), formData);
      onModify(response);
      setErrors([]);
      setFormData({
        notes: '',
        item_modifications: [],
        items_to_add: [],
        items_to_remove: [],
        modification_reason: '',
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to modify requisition';
      console.error('Error in handleSubmit:', error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !requisition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-500 rounded-t-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Modify Requisition #{requisition.id}</h2>
              <p className="text-sm text-primary-100 mt-1">Update requisition details for {requisition.site?.name || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-primary-100 hover:text-white rounded"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Notes</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Enter requisition notes"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Existing Items</span>
            </label>
            {formData.item_modifications.length === 0 && (
              <p className="text-sm text-gray-500">No editable items (all items have been issued).</p>
            )}
            {formData.item_modifications.map((item, index) => {
              const requisitionItem = requisition.items.find((ri) => ri.id === item.request_item_id);
              return (
                <div key={item.request_item_id} className={` ${formData.items_to_remove.includes(item.request_item_id) ? 'bg-red-200 border border-red-300' : ''} grid grid-cols-1 md:grid-cols-4 p-3 rounded-md  gap-4 items-end  `}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Material</label>
                    <select
                      name="item_modifications.material_id"
                      value={item.material_id}
                      onChange={(e) => handleChange(e, index, 'item_modifications')}
                      disabled={isLoadingMaterials}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value={0}>
                        {isLoadingMaterials ? 'Loading materials...' : 'Select a material'}
                      </option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name} {material.code ? `(${material.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Unit</label>
                    <select
                      name="item_modifications.unit_id"
                      value={item.unit_id}
                      onChange={(e) => handleChange(e, index, 'item_modifications')}
                      disabled={isLoadingUnits}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value={0}>
                        {isLoadingUnits ? 'Loading units...' : 'Select a unit'}
                      </option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity Requested</label>
                    <input
                      type="number"
                      name="item_modifications.qty_requested"
                      value={item.qty_requested}
                      onChange={(e) => handleChange(e, index, 'item_modifications')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  {isAdminOrPadiri && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Quantity Approved</label>
                      <input
                        type="number"
                        name="item_modifications.qty_approved"
                        value={item.qty_approved || ''}
                        onChange={(e) => handleChange(e, index, 'item_modifications')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        min="0"
                        step="0.001"
                      />
                    </div>
                  )}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => toggleRemoveItem(item.request_item_id)}
                      className={`p-2 ${formData.items_to_remove.includes(item.request_item_id) ? 'text-red-600' : 'text-gray-600'} hover:text-red-700`}
                      aria-label="Mark item for removal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span>New Items</span>
              </label>
              <button
                type="button"
                onClick={addNewItem}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>
            {formData.items_to_add.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Material</label>
                  <select
                    name="items_to_add.material_id"
                    value={item.material_id}
                    onChange={(e) => handleChange(e, index, 'items_to_add')}
                    disabled={isLoadingMaterials}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={0}>
                      {isLoadingMaterials ? 'Loading materials...' : 'Select a material'}
                    </option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} {material.code ? `(${material.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Unit</label>
                  <select
                    name="items_to_add.unit_id"
                    value={item.unit_id}
                    onChange={(e) => handleChange(e, index, 'items_to_add')}
                    disabled={isLoadingUnits}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={0}>
                      {isLoadingUnits ? 'Loading units...' : 'Select a unit'}
                    </option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity Requested</label>
                  <input
                    type="number"
                    name="items_to_add.qty_requested"
                    value={item.qty_requested}
                    onChange={(e) => handleChange(e, index, 'items_to_add')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.001"
                  />
                </div>
                {isAdminOrPadiri && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity Approved</label>
                    <input
                      type="number"
                      name="items_to_add.qty_approved"
                      value={item.qty_approved || ''}
                      onChange={(e) => handleChange(e, index, 'items_to_add')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                )}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeNewItem(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                    aria-label="Remove new item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Modification Reason <span className="text-red-500">*</span></span>
            </label>
            <textarea
              name="modification_reason"
              value={formData.modification_reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Explain the reason for modifying this requisition"
              rows={3}
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                </div>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingMaterials || isLoadingUnits}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Modifying...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Modify Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyRequisitionModal;
