import React, { useState } from 'react';
import { X, Package, Calendar, Hash, MapPin, User } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import LocationAutocomplete from '../LocationAutocomplete';
import SupplierAutocomplete from '../SupplierAutocomplete';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId?: string;
  articleName?: string;
}

export const StockEntryModal: React.FC<StockEntryModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleName
}) => {
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
    expiryDate: '',
    batchNumber: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { addDocument } = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;

    setLoading(true);
    try {
      await addDocument('movements', {
        articleId,
        articleName,
        type: 'entry',
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        supplier: formData.supplier,
        location: formData.location,
        expiryDate: formData.expiryDate || null,
        batchNumber: formData.batchNumber || null,
        notes: formData.notes || null,
        timestamp: new Date(),
        totalValue: parseInt(formData.quantity) * parseFloat(formData.unitPrice)
      });

      // Reset form
      setFormData({
        quantity: '',
        unitPrice: '',
        supplier: '',
        location: '',
        expiryDate: '',
        batchNumber: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding stock entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            Stock Entry
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {articleName && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Article:</strong> {articleName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Hash className="w-4 h-4 inline mr-1" />
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Supplier *
            </label>
            <SupplierAutocomplete
              value={formData.supplier}
              onChange={(value) => handleInputChange('supplier', value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <LocationAutocomplete
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              value={formData.batchNumber}
              onChange={(e) => handleInputChange('batchNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};