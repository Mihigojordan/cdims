import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Plus, Trash2 } from 'lucide-react';
import requisitionService, { type CreateRequisitionInput } from '../../../services/requestService';
import materialService, { type Material, type Unit } from '../../../services/materialsService';
import siteService, { type Site } from '../../../services/siteService';

interface MaterialRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequisitionInput) => Promise<void>;
}

interface Item {
  material_id: number;
  unit_id: number;
  qty_requested: number;
}

const MaterialRequisitionModal = ({ isOpen, onClose, onSave }: MaterialRequisitionModalProps) => {
  const [formData, setFormData] = useState<CreateRequisitionInput>({
    site_id: 0,
    notes: '',
    items: [{ material_id: 0, unit_id: 0, qty_requested: 0 }],
  });
  const [sites, setSites] = useState<Site[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Load sites, materials, and units when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSites();
      loadMaterials();
      loadUnits();
    }
  }, [isOpen]);

  const loadSites = async () => {
    setIsLoadingSites(true);
    try {
      const { sites } = await siteService.getAllSites();
      setSites(sites);
    } catch (error: any) {
      console.error('Error loading sites:', error);
      setErrors([error.message || 'Failed to load sites']);
    } finally {
      setIsLoadingSites(false);
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index?: number) => {
    try {
      const { name, value } = e.target;
      if (index !== undefined && name.startsWith('items.')) {
        const field = name.split('.')[1];
        setFormData((prev) => {
          const newItems = [...prev.items];
          newItems[index] = { ...newItems[index], [field]: field === 'qty_requested' ? parseFloat(value) || 0 : parseInt(value, 10) || 0 };
          return { ...prev, items: newItems };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: name === 'site_id' ? parseInt(value, 10) || 0 : value,
        }));
      }
      if (errors.length > 0) {
        setErrors([]);
      }
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { material_id: 0, unit_id: 0, qty_requested: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (!formData.site_id || formData.site_id === 0) {
      validationErrors.push('Site is required');
    }

    if (!formData.notes || !formData.notes.trim()) {
      validationErrors.push('Notes are required');
    }

    formData.items.forEach((item, index) => {
      if (!item.material_id || item.material_id === 0) {
        validationErrors.push(`Material is required for item ${index + 1}`);
      }
      if (!item.unit_id || item.unit_id === 0) {
        validationErrors.push(`Unit is required for item ${index + 1}`);
      }
      if (!item.qty_requested || item.qty_requested <= 0) {
        validationErrors.push(`Valid quantity is required for item ${index + 1}`);
      }
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        site_id: 0,
        notes: '',
        items: [{ material_id: 0, unit_id: 0, qty_requested: 0 }],
      });
      setErrors([]);
    }
  }, [isOpen]);

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
      await onSave(formData);
      setErrors([]);
      setFormData({
        site_id: 0,
        notes: '',
        items: [{ material_id: 0, unit_id: 0, qty_requested: 0 }],
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create requisition';
      console.error('Error in handleSubmit:', error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-500 rounded-t-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Create Material Requisition</h2>
              <p className="text-sm text-primary-100 mt-1">Request materials for a site</p>
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
              <span>Site <span className="text-red-500">*</span></span>
            </label>
            <select
              name="site_id"
              value={formData.site_id}
              onChange={handleChange}
              disabled={isLoadingSites}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>
                {isLoadingSites ? 'Loading sites...' : 'Select a site'}
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.code ? `(${site.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Notes <span className="text-red-500">*</span></span>
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
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Materials <span className="text-red-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Material</label>
                  <select
                    name={`items.material_id`}
                    value={item.material_id}
                    onChange={(e) => handleChange(e, index)}
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
                    name={`items.unit_id`}
                    value={item.unit_id}
                    onChange={(e) => handleChange(e, index)}
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
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name={`items.qty_requested`}
                      value={item.qty_requested}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="Enter quantity"
                      min="0"
                      step="0.01"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-600" />
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
              disabled={isSubmitting || isLoadingSites || isLoadingMaterials || isLoadingUnits}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialRequisitionModal;